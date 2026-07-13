// CamerPay's server-to-server confirmation. This is one of the two places
// premium is granted (the other is payment-status, same idempotent RPCs) —
// never the client. verify_jwt MUST be off for this function (see
// supabase/config.toml) because the caller is CamerPay, not a signed-in user.
//
// Authenticité — deux niveaux :
//  1. Si le payload porte une signature HMAC-SHA256 de
//     `transaction_uuid|invoice_id|status|amount` avec notre secret partagé,
//     on la vérifie et on règle directement (chemin rapide).
//  2. Sinon (schéma de signature CamerPay différent, champs renommés…), on ne
//     fait JAMAIS confiance au payload : on en extrait seulement l'identifiant
//     de transaction et on re-vérifie le statut À LA SOURCE via l'API CamerPay
//     (GET /api/payment/{uuid}/status, token secret). Le webhook devient un
//     simple déclencheur — impossible à forger puisque le règlement suit ce
//     que CamerPay répond directement. En production, les webhooks arrivaient
//     avec un format différent et étaient rejetés en 400 ; ce repli les rend
//     opérants sans affaiblir la sécurité.
//
// Secrets (Supabase Vault via get_app_secret, ou variables d'env) :
//   CAMERPAY_WEBHOOK_SECRET   secret HMAC du dashboard (/client/api)
//   CAMERPAY_API_TOKEN        token API pour la re-vérification
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are auto-injected by the platform.

import { createClient } from 'npm:@supabase/supabase-js@2.110.0';

const CAMERPAY_BASE = (Deno.env.get('CAMERPAY_BASE_URL') ?? 'https://camerpay.biz').replace(/\/$/, '');

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

function makeAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

/** Cherche un identifiant de transaction dans les formes connues du payload. */
function extractTransactionUuid(payload: any): string | null {
  const candidates = [
    payload?.transaction_uuid,
    payload?.transaction?.uuid,
    payload?.data?.transaction_uuid,
    payload?.data?.uuid,
    payload?.uuid,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && /^[0-9a-f-]{36}$/i.test(c)) return c;
  }
  return null;
}

/** Règlement par re-vérification à la source (API CamerPay). */
async function settleByRecheck(transactionUuid: string, hint: any): Promise<Response> {
  const admin = makeAdmin();

  const { data: payment } = await admin
    .from('payment_transactions')
    .select('id, status, amount')
    .eq('provider_uuid', transactionUuid)
    .maybeSingle();
  if (!payment) {
    // 200 : transaction inconnue chez nous — inutile que CamerPay réessaie.
    return jsonResponse({ received: true, note: 'unknown_transaction' });
  }
  if (payment.status === 'completed' || payment.status === 'failed' || payment.status === 'canceled') {
    return jsonResponse({ received: true, status: payment.status });
  }

  const apiToken = await getAppSecret('CAMERPAY_API_TOKEN');
  if (!apiToken) {
    console.error('[payment-webhook] CAMERPAY_API_TOKEN missing for recheck');
    return jsonResponse({ error: 'recheck_not_configured' }, 500);
  }

  let remote: any = null;
  try {
    const res = await fetch(`${CAMERPAY_BASE}/api/payment/${transactionUuid}/status`, {
      headers: { Authorization: `Bearer ${apiToken}`, Accept: 'application/json' },
    });
    remote = await res.json().catch(() => null);
    if (!res.ok || !remote) {
      console.error('[payment-webhook] recheck failed', res.status, remote);
      // 500 → CamerPay réessaiera ; le polling payment-status couvre aussi.
      return jsonResponse({ error: 'recheck_failed' }, 500);
    }
  } catch (err) {
    console.error('[payment-webhook] recheck unreachable', err);
    return jsonResponse({ error: 'recheck_unreachable' }, 500);
  }

  const remoteStatus = String(remote.status ?? '');

  if (remoteStatus === 'completed') {
    const { error } = await admin.rpc('settle_camerpay_payment', {
      p_provider_uuid: transactionUuid,
      p_amount: Number(remote.amount ?? payment.amount),
      p_provider_tx_id: null,
      p_payment_method: remote.payment_method ?? null,
      p_paid_at: remote.paid_at ?? null,
      p_raw: { webhook: hint, recheck: remote },
    });
    if (error) {
      const isTerminal = /PAYMENT_NOT_FOUND|AMOUNT_MISMATCH/.test(error.message);
      console.error('[payment-webhook] settle (recheck) failed', error.message);
      return jsonResponse({ error: error.message }, isTerminal ? 400 : 500);
    }
    return jsonResponse({ received: true, status: 'completed', via: 'recheck' });
  }

  if (remoteStatus === 'failed' || remoteStatus === 'cancelled' || remoteStatus === 'refunded') {
    const normalized = remoteStatus === 'failed' ? 'failed' : 'canceled';
    await admin.rpc('fail_camerpay_payment', {
      p_provider_uuid: transactionUuid,
      p_status: normalized,
      p_raw: { webhook: hint, recheck: remote },
    });
    return jsonResponse({ received: true, status: normalized, via: 'recheck' });
  }

  return jsonResponse({ received: true, status: remoteStatus || 'pending', via: 'recheck' });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
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

  const secret = await getAppSecret('CAMERPAY_WEBHOOK_SECRET');

  // Chemin rapide : payload complet + signature vérifiable avec notre schéma.
  const hasSignedShape =
    secret && transactionUuid && invoiceId && status && amount !== undefined && signature;

  if (hasSignedShape) {
    const expected = await hmacSha256Hex(
      `${transactionUuid}|${invoiceId}|${status}|${amount}`,
      secret,
    );
    if (timingSafeEqual(expected, String(signature))) {
      const admin = makeAdmin();

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
          const isTerminal = /PAYMENT_NOT_FOUND|AMOUNT_MISMATCH/.test(error.message);
          console.error('[payment-webhook] settle failed', error.message);
          return jsonResponse({ error: error.message }, isTerminal ? 400 : 500);
        }
        return jsonResponse({ received: true, status: 'completed' });
      }

      if (status === 'failed' || status === 'canceled' || status === 'cancelled') {
        await admin.rpc('fail_camerpay_payment', {
          p_provider_uuid: transactionUuid,
          p_status: status === 'failed' ? 'failed' : 'canceled',
          p_raw: payload,
        });
        return jsonResponse({ received: true, status });
      }

      return jsonResponse({ received: true, status });
    }
    console.warn('[payment-webhook] signature mismatch — falling back to recheck', {
      transactionUuid,
      invoiceId,
    });
  }

  // Repli sûr : le payload ne sert que d'indice, la vérité vient de CamerPay.
  const uuid = extractTransactionUuid(payload);
  if (uuid) {
    return settleByRecheck(uuid, payload);
  }

  console.warn('[payment-webhook] unusable payload', Object.keys(payload ?? {}));
  return jsonResponse({ error: 'incomplete_payload' }, 400);
});
