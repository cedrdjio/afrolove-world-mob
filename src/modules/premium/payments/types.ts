/**
 * Payment abstraction — one stable contract, many providers.
 *
 * The app never talks to a payment provider directly: it asks paymentService
 * to check out a plan and gets back a normalized outcome. CamerPay is today's
 * only implementation (mobile money for Central/West Africa); Google Play, the
 * App Store or Stripe plug in as additional providers, selected by region, with
 * zero changes to the screens or the premium hooks.
 */

export type PaymentOutcome =
  | 'succeeded' // premium is (or is about to be) granted server-side
  | 'pending' // paid or left open — server will confirm shortly, not yet visible
  | 'canceled' // the user backed out before paying
  | 'failed'; // the provider rejected or the payment errored

export interface PaymentResult {
  outcome: PaymentOutcome;
  /** Provider-side reference (e.g. CamerPay transaction_uuid), for support/debug. */
  providerRef?: string;
}

/** Méthodes acceptées par CamerPay (cf. OpenAPI /api/payment/initiate). */
export type CheckoutMethod = 'mtn_momo' | 'orange_money' | 'stripe' | 'paypal';

export interface CheckoutInput {
  /** Matches premium_plans.key in the database. */
  planKey: string;
  /** Méthode choisie : mobile money (détectée depuis le numéro), carte
   *  bancaire via Stripe, ou PayPal. */
  paymentMethod: CheckoutMethod;
  /** Numéro Mobile Money du payeur (9 chiffres, validé côté app) —
   *  requis uniquement pour mtn_momo / orange_money. */
  phone?: string;
}

export interface PaymentProvider {
  /** Stable id, mirrors subscriptions.provider (e.g. 'camerpay', 'google'). */
  readonly id: string;
  /** Whether this provider can run on the current device/region right now. */
  isAvailable(): Promise<boolean>;
  /** Run the full checkout and resolve once the outcome is known. */
  checkout(input: CheckoutInput): Promise<PaymentResult>;
}
