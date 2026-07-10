import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PLAN_TONE_STYLES, TONE_BY_PLAN_KEY, type PlanTone } from '@/modules/premium/constants/plans';
import type { PremiumPlan } from '@/modules/premium/services/premiumService';

interface PricingCardProps {
  plan: PremiumPlan;
  onChoose: (plan: PremiumPlan) => void;
  loading?: boolean;
  badge?: string;
}

function formatPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  const symbol = currency === 'EUR' ? '€' : ` ${currency}`;
  return `${Number.isInteger(amount) ? amount : amount.toFixed(2)}${symbol}`;
}

/** Carte tarif de la landing premium — branchée sur la table premium_plans.
 *  Elle ne fait que remonter le choix (onChoose) ; l'achat réel et le routage
 *  du résultat (succès / en cours / échec) sont gérés par l'écran parent. */
export function PricingCard({ plan, onChoose, loading = false, badge }: PricingCardProps) {
  const toneKey: PlanTone = TONE_BY_PLAN_KEY[plan.key] ?? 'gold';
  const tone = PLAN_TONE_STYLES[toneKey];

  const handlePress = () => {
    if (loading) return;
    Haptics.selectionAsync().catch(() => {});
    onChoose(plan);
  };

  return (
    <View
      className="relative rounded-2xl px-2.5 py-3"
      style={{ backgroundColor: tone.bg, borderWidth: badge ? 1.5 : 1, borderColor: tone.border }}
    >
      {badge ? (
        <View
          className="absolute self-center rounded-full px-2.5 py-1"
          style={{ top: -10, backgroundColor: '#9B7EDE' }}
        >
          <Text className="font-heading text-[8px] text-white">{badge}</Text>
        </View>
      ) : null}
      <Text className="mb-1.5 text-center font-heading text-[8.5px] tracking-wide" style={{ color: tone.text }}>
        {plan.label}
      </Text>
      <Text className="mb-0.5 text-center font-display text-[22px] text-white">
        {formatPrice(plan.priceCents, plan.currency)}
      </Text>
      <Text className="mb-2 text-center font-body text-[9px] text-white/[0.38]" numberOfLines={1}>
        {plan.description ?? `${plan.durationDays} jours`}
      </Text>
      <Pressable
        onPress={handlePress}
        disabled={loading}
        className="rounded-lg py-1.5"
        style={{ backgroundColor: tone.cta }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-center font-heading text-[9px] text-white">Choisir</Text>
        )}
      </Pressable>
    </View>
  );
}
