/** Styles visuels des cartes tarifs — les données (libellé, prix, durée)
 *  viennent de la table premium_plans, jamais d'ici. Toute la gamme reste
 *  dans la charte lavande : intensité croissante, aucune couleur hors palette. */
export type PlanTone = 'neutral' | 'blue' | 'red' | 'orange' | 'green' | 'gold';

// Les clés correspondent exactement à premium_plans.key en base — c'est ce
// qui part dans l'achat réel (usePurchasePlan → CamerPay).
export const TONE_BY_PLAN_KEY: Record<string, PlanTone> = {
  discovery_1d: 'blue',
  week_7d: 'red',
  month_1m: 'orange',
  quarter_3m: 'green',
  year_1y: 'gold',
};

/** Clé du plan mis en avant avec le badge « Meilleur ». */
export const BEST_PLAN_KEY = 'year_1y';

export const PLAN_TONE_STYLES: Record<PlanTone, { bg: string; border: string; text: string; cta: string }> = {
  neutral: { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.18)', text: 'rgba(255,255,255,0.5)', cta: 'rgba(255,255,255,0.14)' },
  blue: { bg: 'rgba(195,177,225,0.12)', border: 'rgba(195,177,225,0.3)', text: '#C3B1E1', cta: 'rgba(195,177,225,0.3)' },
  red: { bg: 'rgba(169,143,216,0.16)', border: 'rgba(169,143,216,0.34)', text: '#A98FD8', cta: 'rgba(169,143,216,0.38)' },
  orange: { bg: 'rgba(155,126,222,0.2)', border: 'rgba(155,126,222,0.4)', text: '#B9A2E8', cta: 'rgba(155,126,222,0.42)' },
  green: { bg: 'rgba(139,105,214,0.22)', border: 'rgba(139,105,214,0.42)', text: '#8B69D6', cta: 'rgba(139,105,214,0.45)' },
  gold: { bg: 'rgba(155,126,222,0.28)', border: 'rgba(155,126,222,0.55)', text: '#9B7EDE', cta: 'rgba(155,126,222,0.5)' },
};
