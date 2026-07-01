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

export const PREMIUM_PLANS: PremiumPlan[] = [
  { key: 'free', label: 'Gratuit', price: '0€', description: 'Max 5 profils', tone: 'neutral', cta: 'Gratuit' },
  { key: 'discovery', label: 'Découverte', price: '2€', description: '1 jour / 24h', tone: 'blue', cta: 'Choisir' },
  { key: '7days', label: '7 Jours', price: '5€', description: 'Accès illimité', tone: 'red', cta: 'Choisir' },
  { key: '1month', label: '1 Mois', price: '15€', description: 'Accès illimité', tone: 'orange', cta: 'Choisir' },
  { key: '3months', label: '3 Mois', price: '25€', description: 'Accès illimité', tone: 'green', cta: 'Choisir' },
  { key: '1year', label: '1 An', price: '65€', description: '365 jours', tone: 'gold', cta: 'Choisir', badge: 'Meilleur' },
];

export const PLAN_TONE_STYLES: Record<PremiumPlan['tone'], { bg: string; border: string; text: string; cta: string }> = {
  neutral: { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.18)', text: 'rgba(255,255,255,0.5)', cta: 'rgba(255,255,255,0.14)' },
  blue: { bg: 'rgba(40,96,176,0.14)', border: 'rgba(40,96,176,0.3)', text: '#5B9BE8', cta: 'rgba(40,96,176,0.3)' },
  red: { bg: 'rgba(200,60,50,0.25)', border: 'rgba(200,60,50,0.4)', text: '#FF9E8C', cta: 'rgba(200,60,50,0.5)' },
  orange: { bg: 'rgba(200,110,20,0.25)', border: 'rgba(200,110,20,0.4)', text: '#FFBE64', cta: 'rgba(200,110,20,0.5)' },
  green: { bg: 'rgba(30,140,60,0.22)', border: 'rgba(30,140,60,0.38)', text: '#78F096', cta: 'rgba(30,140,60,0.45)' },
  gold: { bg: 'rgba(201,134,42,0.28)', border: 'rgba(201,134,42,0.55)', text: '#C9862A', cta: 'rgba(201,134,42,0.5)' },
};
