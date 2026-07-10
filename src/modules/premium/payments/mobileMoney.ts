/**
 * Validation des numéros Mobile Money camerounais et détection de l'opérateur.
 *
 * Les numéros mobiles camerounais font 9 chiffres et commencent par 6.
 * Répartition des préfixes (source : opérateurs, 2026) :
 *   MTN    → 650-654, 67x, 68x
 *   Orange → 655-659, 69x
 * On accepte les saisies avec +237 / 237 / 00237 en tête, qu'on normalise.
 */

export type MobileOperator = 'mtn' | 'orange';

export interface OperatorInfo {
  operator: MobileOperator;
  /** Libellé affiché à l'utilisateur. */
  label: string;
  /** Méthode transmise à CamerPay. */
  paymentMethod: 'mtn_momo' | 'orange_money';
}

const MTN_RE = /^6(5[0-4]|7\d|8\d)\d{6}$/;
const ORANGE_RE = /^6(5[5-9]|9\d)\d{6}$/;

/** Réduit une saisie libre au numéro local à 9 chiffres (retire +237/237/00237). */
export function normalizeCmPhone(raw: string): string {
  let digits = (raw ?? '').replace(/\D/g, '');
  if (digits.startsWith('00237')) digits = digits.slice(5);
  else if (digits.startsWith('237') && digits.length > 9) digits = digits.slice(3);
  return digits;
}

/** Renvoie l'opérateur si le numéro est un MoMo camerounais valide, sinon null. */
export function detectOperator(raw: string): OperatorInfo | null {
  const n = normalizeCmPhone(raw);
  if (MTN_RE.test(n)) {
    return { operator: 'mtn', label: 'MTN Mobile Money', paymentMethod: 'mtn_momo' };
  }
  if (ORANGE_RE.test(n)) {
    return { operator: 'orange', label: 'Orange Money', paymentMethod: 'orange_money' };
  }
  return null;
}

export function isValidCmMomo(raw: string): boolean {
  return detectOperator(raw) !== null;
}

/** Format lisible : 6 XX XX XX XX. */
export function formatCmPhone(raw: string): string {
  const n = normalizeCmPhone(raw).slice(0, 9);
  const parts = [n.slice(0, 1), n.slice(1, 3), n.slice(3, 5), n.slice(5, 7), n.slice(7, 9)];
  return parts.filter(Boolean).join(' ');
}
