// CamerPay's server-to-server confirmation. This is the ONLY place premium is
// actually granted — never the client, never payment-initiate. CamerPay POSTs
// here (merchant_callback_url) after every settled payment and retries up to 5x,
// so everything downstream is idempotent. verify_jwt MUST be off for this
// function (see supabase/config.toml) because the caller is CamerPay, not a
// signed-in user; authenticity is proven by the HMAC-SHA256 signature instead.
//
// Required secret (Supabase Vault `vault.create_secret(...)` — lu via le RPC
// get_app_secret, service_role uniquement — ou `supabase secrets set`) :
//   CAMERPAY_WEBHOOK_SECRET   the secret configured on CamerPay's dashboard
//                             (/client/api), used to sign the payload.
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are auto-injected by the platform.

import { createClient } from 'npm:@supabase/supabase-js@2.110.0';

const encoder = new TextEncoder();

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time comparison so a wrong signature can't be teased out by timing.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Secrets applicatifs : Supabase Vault d'abord (RPC get_app_secret, réservé
// au service_role), variable d'environnement en repli.
const secretsCache = new Map<string, string>();
async function getAppSecret(name: string): Promise<string | null> {
  const cached = secretsCache.get(name);
  if (cached) return cached;
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { data } = await admin.rpc('get_app_secret', { p_name: name });
  const value = (typeof data === 'string' && data.length > 0 ? data : null) ?? Deno.env.get(name) ?? null;
  if (value) secretsCache.set(name, value);
  return value;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const secret = await getAppSecret('CAMERPAY_WEBHOOK_SECRET');
  if (!secret) {
    console.error('[payment-webhook] CAMERPAY_WEBHOOK_SECRET is not set (Vault or env)');
    return jsonResponse({ error: 'webhook_not_configured' }, 500);
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'invalid_body' }, 400);
  }

  const {
    transaction_uuid: transactionUuid,
    invoice_id: invoiceId,
    status,
    amount,
    signature,
    provider_tx_id: providerTxId,
    payment_method: paymentMethod,
    paid_at: paidAt,
  } = payload ?? {};

  if (!transactionUuid || !invoiceId || !status || amount === undefined || !signature) {
    return jsonResponse({ error: 'incomplete_payload' }, 400);
  }

  // Signature covers transaction_uuid|invoice_id|status|amount, signed with the
  // shared secret (per CamerPay's documented HMAC-SHA256 scheme).
  const expected = await hmacSha256Hex(
    `${transactionUuid}|${invoiceId}|${status}|${amount}`,
    secret,
  );
  if (!timingSafeEqual(expected, String(signature))) {
    console.warn('[payment-webhook] signature mismatch', { transactionUuid, invoiceId });
    return jsonResponse({ error: 'invalid_signature' }, 401);
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  if (status === 'completed') {
    const { error } = await admin.rpc('settle_camerpay_payment', {
      p_provider_uuid: transactionUuid,
      p_amount: Number(amount),
      p_provider_tx_id: providerTxId ?? null,
      p_payment_method: paymentMethod ?? null,
      p_paid_at: paidAt ?? null,
      p_raw: payload,
    });
    if (error) {
      // PAYMENT_NOT_FOUND / AMOUNT_MISMATCH → 400 so CamerPay stops retrying a
      // payload we will never accept; anything else → 500 so it retries.
      const isTerminal = /PAYMENT_NOT_FOUND|AMOUNT_MISMATCH/.test(error.message);
      console.error('[payment-webhook] settle failed', error.message);
      return jsonResponse({ error: error.message }, isTerminal ? 400 : 500);
    }
    return jsonResponse({ received: true, status: 'completed' });
  }

  if (status === 'failed' || status === 'canceled') {
    await admin.rpc('fail_camerpay_payment', {
      p_provider_uuid: transactionUuid,
      p_status: status,
      p_raw: payload,
    });
    return jsonResponse({ received: true, status });
  }

  // Intermediate states (e.g. still pending) — acknowledge without acting.
  return jsonResponse({ received: true, status });
});
