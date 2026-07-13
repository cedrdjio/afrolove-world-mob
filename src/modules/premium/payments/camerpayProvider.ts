import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/shared/services/supabase/client';
import { logEvent } from '@/shared/services/logService';
import type { CheckoutInput, PaymentProvider, PaymentResult } from './types';

// Where CamerPay sends the browser back to; must match the app scheme so the
// hosted pay page can hand control back and auto-close the in-app browser.
// The server can override the provider-side return_url via CAMERPAY_RETURN_URL.
const RETURN_URL = 'afrolove://premium/callback';

// The payment-webhook, not the browser, is the source of truth. After the pay
// sheet closes we poll our own payment row (readable via RLS) until the webhook
// has settled it. Mobile-money confirmations can lag a few seconds.
const POLL_INTERVAL_MS = 2500;
const POLL_WINDOW_RETURNED_MS = 90_000; // user came back through the return URL
const POLL_WINDOW_DISMISSED_MS = 12_000; // user closed the sheet themselves

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface InitiateResponse {
  payUrl: string;
  transactionUuid: string;
  invoiceId: string;
}

async function initiate(input: CheckoutInput): Promise<InitiateResponse> {
  const { data, error } = await supabase.functions.invoke('payment-initiate', {
    // phone est absent pour Stripe/PayPal — CamerPay n'en a pas besoin, le
    // client renseigne sa carte / son compte sur la page hébergée.
    body: { planKey: input.planKey, phone: input.phone ?? undefined, paymentMethod: input.paymentMethod },
  });
  if (error) throw error;
  if (!data?.payUrl || !data?.transactionUuid) {
    throw new Error('Le paiement n’a pas pu être démarré.');
  }
  return data as InitiateResponse;
}

/**
 * Asks the payment-status Edge Function, which re-checks with CamerPay and
 * settles the transaction server-side — premium activates even if the webhook
 * hasn't been configured or its callback got lost. Falls back to reading our
 * own payment row (RLS: own rows) if the function is unreachable.
 */
async function fetchStatus(transactionUuid: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('payment-status', {
    body: { transactionUuid },
  });
  if (!error && typeof data?.status === 'string') return data.status;

  const { data: row } = await supabase
    .from('payment_transactions')
    .select('status')
    .eq('provider_uuid', transactionUuid)
    .maybeSingle();
  return row?.status ?? 'pending';
}

async function pollUntilResolved(
  transactionUuid: string,
  windowMs: number,
): Promise<PaymentResult | null> {
  const deadline = Date.now() + windowMs;
  while (Date.now() < deadline) {
    const status = await fetchStatus(transactionUuid);
    if (status === 'completed') return { outcome: 'succeeded', providerRef: transactionUuid };
    if (status === 'failed' || status === 'canceled') {
      return { outcome: 'failed', providerRef: transactionUuid };
    }
    await sleep(POLL_INTERVAL_MS);
  }
  return null; // still pending when the window elapsed
}

export const camerpayProvider: PaymentProvider = {
  id: 'camerpay',

  async isAvailable() {
    return true;
  },

  async checkout(input: CheckoutInput): Promise<PaymentResult> {
    let payUrl: string;
    let transactionUuid: string;
    try {
      ({ payUrl, transactionUuid } = await initiate(input));
    } catch (error) {
      logEvent('error', 'payment_initiate_failed', error instanceof Error ? error.message : String(error), {
        planKey: input.planKey,
        method: input.paymentMethod,
      });
      throw error;
    }
    logEvent('info', 'payment_initiated', undefined, {
      planKey: input.planKey,
      method: input.paymentMethod,
      transactionUuid,
    });

    // Opens CamerPay's hosted page; resolves when the browser is redirected to
    // RETURN_URL ('success') or the user dismisses the sheet ('cancel'/'dismiss').
    const session = await WebBrowser.openAuthSessionAsync(payUrl, RETURN_URL);

    // Came back through the return URL → likely paid, give the webhook time.
    let result: PaymentResult;
    if (session.type === 'success') {
      result = (await pollUntilResolved(transactionUuid, POLL_WINDOW_RETURNED_MS)) ?? {
        outcome: 'pending',
        providerRef: transactionUuid,
      };
    } else {
      // User closed the sheet. They may still have paid (then dismissed), so
      // poll a short grace window; otherwise treat it as canceled.
      result =
        (await pollUntilResolved(transactionUuid, POLL_WINDOW_DISMISSED_MS)) ?? {
          outcome: 'canceled',
          providerRef: transactionUuid,
        };
    }

    logEvent(result.outcome === 'failed' ? 'warn' : 'info', 'payment_outcome', result.outcome, {
      planKey: input.planKey,
      method: input.paymentMethod,
      transactionUuid,
      browserSession: session.type,
    });
    return result;
  },
};
