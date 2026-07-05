export interface PremiumPlan {
  key: string;
  label: string;
  price: string;
  suffix?: string;
  description: string;
  tone: 'neutral' | 'blue' | 'red' | 'orange' | 'green' | 'gold';
  cta: string;
  badge?: string;
}

// Les clés correspondent exactement à premium_plans.key en base — c'est ce
// qui part dans purchase_subscription_dev(p_plan_key).
export const PREMIUM_PLANS: PremiumPlan[] = [
  { key: 'free', label: 'Gratuit', price: '0€', description: 'Max 5 profils', tone: 'neutral', cta: 'Gratuit' },
  { key: 'discovery_1d', label: 'Découverte', price: '2€', description: '1 jour / 24h', tone: 'blue', cta: 'Choisir' },
  { key: 'week_7d', label: '7 Jours', price: '5€', description: 'Accès illimité', tone: 'red', cta: 'Choisir' },
  { key: 'month_1m', label: '1 Mois', price: '15€', description: 'Accès illimité', tone: 'orange', cta: 'Choisir' },
  { key: 'quarter_3m', label: '3 Mois', price: '25€', description: 'Accès illimité', tone: 'green', cta: 'Choisir' },
  { key: 'year_1y', label: '1 An', price: '65€', description: '365 jours', tone: 'gold', cta: 'Choisir', badge: 'Meilleur' },
];

// Toute la gamme reste dans la charte lavande — intensité croissante
// au lieu de couleurs criardes hors palette.
export const PLAN_TONE_STYLES: Record<PremiumPlan['tone'], { bg: string; border: string; text: string; cta: string }> = {
  neutral: { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.18)', text: 'rgba(255,255,255,0.5)', cta: 'rgba(255,255,255,0.14)' },
  blue: { bg: 'rgba(195,177,225,0.12)', border: 'rgba(195,177,225,0.3)', text: '#C3B1E1', cta: 'rgba(195,177,225,0.3)' },
  red: { bg: 'rgba(169,143,216,0.16)', border: 'rgba(169,143,216,0.34)', text: '#A98FD8', cta: 'rgba(169,143,216,0.38)' },
  orange: { bg: 'rgba(155,126,222,0.2)', border: 'rgba(155,126,222,0.4)', text: '#B9A2E8', cta: 'rgba(155,126,222,0.42)' },
  green: { bg: 'rgba(139,105,214,0.22)', border: 'rgba(139,105,214,0.42)', text: '#8B69D6', cta: 'rgba(139,105,214,0.45)' },
  gold: { bg: 'rgba(155,126,222,0.28)', border: 'rgba(155,126,222,0.55)', text: '#9B7EDE', cta: 'rgba(155,126,222,0.5)' },
};
