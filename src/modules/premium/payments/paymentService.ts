import { camerpayProvider } from './camerpayProvider';
import type { CheckoutInput, PaymentProvider, PaymentResult } from './types';

/**
 * Provider registry. Adding a provider (Google Play, App Store, Stripe) is a
 * one-line change here plus its implementation file — nothing else in the app
 * moves. Order matters: selectProvider picks the first available one.
 */
const PROVIDERS: PaymentProvider[] = [camerpayProvider];

/**
 * Chooses which provider to use for this checkout. Today CamerPay is the only
 * one, so this returns it. The seam for region/store routing lives here: e.g.
 * prefer native billing on iOS/Android in card-friendly regions, fall back to
 * CamerPay (mobile money) elsewhere.
 */
async function selectProvider(): Promise<PaymentProvider> {
  for (const provider of PROVIDERS) {
    if (await provider.isAvailable()) return provider;
  }
  throw new Error('Aucun moyen de paiement n’est disponible pour le moment.');
}

async function checkout(input: CheckoutInput): Promise<PaymentResult> {
  const provider = await selectProvider();
  return provider.checkout(input);
}

export const paymentService = {
  checkout,
  selectProvider,
};
