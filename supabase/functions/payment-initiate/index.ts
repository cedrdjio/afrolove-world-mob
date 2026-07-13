// Starts a CamerPay checkout for a premium plan. The client only ever sends a
// plan_key with its own Supabase session (verify_jwt is on); the price, the
// EUR→XAF conversion, the invoice reference and — crucially — the CamerPay API
// token all stay server-side. CamerPay returns a hosted pay_url the app opens
// in a browser; the actual premium grant happens later in payment-webhook, the
// source of truth. This function never activates anything.
//
// Required secrets (supabase secrets set — never in client code):
//   CAMERPAY_API_TOKEN        Bearer token for CamerPay's API (sandbox or live)
// Optional secrets:
//   CAMERPAY_BASE_URL         defaults to https://camerpay.biz
//   CAMERPAY_RETURN_URL       where CamerPay sends the browser after payment.
//                             MUST be http(s) — CamerPay validates it as a URL
//                             (a custom app scheme is rejected with 422, which
//                             used to fail every initiation). Defaults to our
//                             public payment-return function, which bridges
//                             back to the app deep link.
// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are auto-injected.

import { createClient } from 'npm:@supabase/supabase-js@2.110.0';

// Fixed CFA franc (BEAC) peg. Plans are priced in EUR; CamerPay charges in XAF.
const EUR_TO_XAF = 655.957;

const CAMERPAY_BASE = (Deno.env.get('CAMERPAY_BASE_URL') ?? 'https://camerpay.biz').replace(/\/$/, '');

// CamerPay requires a valid http(s) merchant_return_url — anything else is
// rejected at initiation. Non-http overrides are ignored on purpose.
function resolveReturnUrl(): string {
  const override = Deno.env.get('CAMERPAY_RETURN_URL');
  if (override && /^https?:\/\//i.test(override)) return override;
  return `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-return`;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'missing_authorization' }, 401);
  }

  const apiToken = Deno.env.get('CAMERPAY_API_TOKEN');
  if (!apiToken) {
    console.error('[payment-initiate] CAMERPAY_API_TOKEN is not set');
    return jsonResponse({ error: 'payment_not_configured' }, 500);
  }

  // Identify the caller from their own JWT (respects RLS on the plan read).
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return jsonResponse({ error: 'invalid_session' }, 401);
  }

  let planKey: string | undefined;
  let phone: string | undefined;
  let paymentMethod: string | undefined;
  try {
    const body = await req.json();
    planKey = body?.planKey;
    phone = typeof body?.phone === 'string' ? body.phone.replace(/\D/g, '') : undefined;
    paymentMethod = typeof body?.paymentMethod === 'string' ? body.paymentMethod : undefined;
  } catch {
    return jsonResponse({ error: 'invalid_body' }, 400);
  }
  if (!planKey || typeof planKey !== 'string') {
    return jsonResponse({ error: 'missing_plan_key' }, 400);
  }

  // Trust the DB for the price — never the client. Active plans only.
  const { data: plan, error: planError } = await userClient
    .from('premium_plans')
    .select('key, label, price_cents, currency')
    .eq('key', planKey)
    .eq('is_active', true)
    .maybeSingle();
  if (planError) {
    return jsonResponse({ error: planError.message }, 400);
  }
  if (!plan) {
    return jsonResponse({ error: 'unknown_plan' }, 404);
  }

  // premium_plans stores EUR cents; CamerPay wants an integer XAF amount.
  const amountXaf = Math.round((plan.price_cents / 100) * EUR_TO_XAF);
  if (amountXaf <= 0) {
    return jsonResponse({ error: 'invalid_amount' }, 400);
  }

  // Unique, human-traceable invoice reference; also our idempotency anchor.
  const invoiceId = `AFL-${user.id.slice(0, 8)}-${Date.now().toString(36)}`.toUpperCase();

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Best-effort display name for the CamerPay invoice; email comes from auth.
  const { data: profile } = await admin
    .from('profiles')
    .select('first_name')
    .eq('id', user.id)
    .maybeSingle();
  const customerName = profile?.first_name?.trim() || 'AfriLove Member';

  // Record the attempt before calling out, so the webhook has a row to settle
  // even if our response to the app is lost.
  const { data: payment, error: insertError } = await admin
    .from('payment_transactions')
    .insert({
      profile_id: user.id,
      plan_key: plan.key,
      provider: 'camerpay',
      status: 'pending',
      invoice_id: invoiceId,
      amount: amountXaf,
      currency: 'XAF',
      amount_source_cents: plan.price_cents,
      payment_method: paymentMethod || null,
    })
    .select('id')
    .single();
  if (insertError || !payment) {
    console.error('[payment-initiate] insert failed', insertError);
    return jsonResponse({ error: 'could_not_create_payment' }, 500);
  }

  const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`;

  let camerpayJson: any;
  try {
    const camerpayRes = await fetch(`${CAMERPAY_BASE}/api/payment/initiate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        amount: amountXaf,
        currency: 'XAF',
        merchant_invoice_id: invoiceId,
        customer_name: customerName,
        customer_email: user.email ?? undefined,
        customer_phone: phone || undefined,
        payment_method: paymentMethod || undefined,
        merchant_callback_url: callbackUrl,
        merchant_return_url: resolveReturnUrl(),
        source: 'api',
      }),
    });
    camerpayJson = await camerpayRes.json().catch(() => ({}));
    if (!camerpayRes.ok || !camerpayJson?.success || !camerpayJson?.pay_url) {
      console.error('[payment-initiate] CamerPay rejected', camerpayRes.status, camerpayJson);
      await admin
        .from('payment_transactions')
        .update({ status: 'failed', raw: camerpayJson, updated_at: new Date().toISOString() })
        .eq('id', payment.id);
      return jsonResponse({ error: 'provider_error' }, 502);
    }
  } catch (err) {
    console.error('[payment-initiate] CamerPay call failed', err);
    await admin
      .from('payment_transactions')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', payment.id);
    return jsonResponse({ error: 'provider_unreachable' }, 502);
  }

  const transactionUuid = camerpayJson.transaction_uuid as string;
  await admin
    .from('payment_transactions')
    .update({ provider_uuid: transactionUuid, updated_at: new Date().toISOString() })
    .eq('id', payment.id);

  return jsonResponse({
    payUrl: camerpayJson.pay_url,
    transactionUuid,
    invoiceId,
    amount: amountXaf,
    currency: 'XAF',
  });
});
