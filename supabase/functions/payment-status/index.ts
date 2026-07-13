// Vérification active du statut d'un paiement CamerPay, appelée par l'app
// pendant qu'elle attend la confirmation (polling après fermeture de la page
// de paiement). Contrairement à une simple lecture de payment_transactions,
// cette fonction interroge CamerPay /api/payment/{uuid}/status — qui re-vérifie
// lui-même auprès du provider (Orange, MTN, Stripe…) — puis règle la
// transaction en base via les mêmes RPC idempotents que le webhook
// (settle_camerpay_payment / fail_camerpay_payment). Le premium est donc
// activé correctement même si le webhook n'est pas encore configuré ou si
// son callback se perd.
//
// verify_jwt est ON : seul le propriétaire authentifié de la transaction
// peut la consulter (contrôle profile_id ci-dessous).
//
// Secrets requis : CAMERPAY_API_TOKEN (déjà utilisé par payment-initiate).

import { createClient } from 'npm:@supabase/supabase-js@2.110.0';

const CAMERPAY_BASE = (Deno.env.get('CAMERPAY_BASE_URL') ?? 'https://camerpay.biz').replace(/\/$/, '');

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

  let transactionUuid: string | undefined;
  try {
    const body = await req.json();
    transactionUuid = typeof body?.transactionUuid === 'string' ? body.transactionUuid : undefined;
  } catch {
    return jsonResponse({ error: 'invalid_body' }, 400);
  }
  if (!transactionUuid) {
    return jsonResponse({ error: 'missing_transaction_uuid' }, 400);
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: payment } = await admin
    .from('payment_transactions')
    .select('id, profile_id, status, amount')
    .eq('provider_uuid', transactionUuid)
    .maybeSingle();
  if (!payment) {
    return jsonResponse({ error: 'payment_not_found' }, 404);
  }
  if (payment.profile_id !== user.id) {
    return jsonResponse({ error: 'forbidden' }, 403);
  }

  // Déjà réglé (par le webhook ou un poll précédent) — rien à re-vérifier.
  if (payment.status === 'completed' || payment.status === 'failed' || payment.status === 'canceled') {
    return jsonResponse({ status: payment.status });
  }

  const apiToken = await getAppSecret('CAMERPAY_API_TOKEN');
  if (!apiToken) {
    console.error('[payment-status] CAMERPAY_API_TOKEN is not set (Vault or env)');
    return jsonResponse({ status: payment.status });
  }

  let remote: any = null;
  try {
    const res = await fetch(`${CAMERPAY_BASE}/api/payment/${transactionUuid}/status`, {
      headers: { Authorization: `Bearer ${apiToken}`, Accept: 'application/json' },
    });
    remote = await res.json().catch(() => null);
    if (!res.ok || !remote) {
      console.error('[payment-status] CamerPay status check failed', res.status, remote);
      return jsonResponse({ status: payment.status });
    }
  } catch (err) {
    console.error('[payment-status] CamerPay unreachable', err);
    return jsonResponse({ status: payment.status });
  }

  const remoteStatus = String(remote.status ?? '');

  if (remoteStatus === 'completed') {
    const { error } = await admin.rpc('settle_camerpay_payment', {
      p_provider_uuid: transactionUuid,
      p_amount: Number(remote.amount ?? payment.amount),
      p_provider_tx_id: null,
      p_payment_method: remote.payment_method ?? null,
      p_paid_at: remote.paid_at ?? null,
      p_raw: remote,
    });
    if (error) {
      console.error('[payment-status] settle failed', error.message);
      return jsonResponse({ status: payment.status });
    }
    return jsonResponse({ status: 'completed' });
  }

  if (remoteStatus === 'failed' || remoteStatus === 'cancelled' || remoteStatus === 'refunded') {
    const normalized = remoteStatus === 'failed' ? 'failed' : 'canceled';
    await admin.rpc('fail_camerpay_payment', {
      p_provider_uuid: transactionUuid,
      p_status: normalized,
      p_raw: remote,
    });
    return jsonResponse({ status: normalized });
  }

  // pending / processing — toujours en cours côté provider.
  return jsonResponse({ status: payment.status });
});
