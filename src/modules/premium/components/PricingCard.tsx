import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { PLAN_TONE_STYLES, type PremiumPlan } from '@/modules/premium/constants/plans';

export function PricingCard({ plan }: { plan: PremiumPlan }) {
  const router = useRouter();
  const tone = PLAN_TONE_STYLES[plan.tone];

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    if (plan.key === 'free') return;
    router.push({ pathname: '/premium/success', params: { plan: plan.label } });
  };

  return (
    <View
      className="relative rounded-2xl px-2.5 py-3"
      style={{ backgroundColor: tone.bg, borderWidth: plan.badge ? 1.5 : 1, borderColor: tone.border }}
    >
      {plan.badge ? (
        <View
          className="absolute self-center rounded-full px-2.5 py-1"
          style={{ top: -10, backgroundColor: '#C9862A' }}
        >
          <Text className="font-heading text-[8px] uppercase text-white">{plan.badge}</Text>
        </View>
      ) : null}
      <Text className="mb-1.5 text-center font-heading text-[8.5px] uppercase tracking-wide" style={{ color: tone.text }}>
        {plan.label}
      </Text>
      <Text className="mb-0.5 text-center font-display text-[22px] text-white">{plan.price}</Text>
      <Text className="mb-2 text-center font-body text-[9px] text-white/38">{plan.description}</Text>
      <Pressable onPress={handlePress} className="rounded-lg py-1.5" style={{ backgroundColor: tone.cta }}>
        <Text className="text-center font-heading text-[9px] uppercase text-white">{plan.cta}</Text>
      </Pressable>
    </View>
  );
}
