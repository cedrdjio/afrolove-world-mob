/** Styles visuels des cartes tarifs — les données (libellé, prix, durée)
 *  viennent de la table premium_plans, jamais d'ici. */
export type PlanTone = 'neutral' | 'blue' | 'red' | 'orange' | 'green' | 'gold';

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
  blue: { bg: 'rgba(40,96,176,0.14)', border: 'rgba(40,96,176,0.3)', text: '#5B9BE8', cta: 'rgba(40,96,176,0.3)' },
  red: { bg: 'rgba(200,60,50,0.25)', border: 'rgba(200,60,50,0.4)', text: '#FF9E8C', cta: 'rgba(200,60,50,0.5)' },
  orange: { bg: 'rgba(200,110,20,0.25)', border: 'rgba(200,110,20,0.4)', text: '#FFBE64', cta: 'rgba(200,110,20,0.5)' },
  green: { bg: 'rgba(30,140,60,0.22)', border: 'rgba(30,140,60,0.38)', text: '#78F096', cta: 'rgba(30,140,60,0.45)' },
  gold: { bg: 'rgba(155,126,222,0.28)', border: 'rgba(155,126,222,0.55)', text: '#9B7EDE', cta: 'rgba(155,126,222,0.5)' },
};
