import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { usePurchasePlan } from '@/modules/premium/hooks/usePremium';
import { PLAN_TONE_STYLES, type PremiumPlan } from '@/modules/premium/constants/plans';

/** Carte tarif de la landing premium — déclenche le vrai achat
 *  (purchase_subscription_dev) ; avant elle poussait directement l'écran
 *  succès sans rien activer. */
export function PricingCard({ plan }: { plan: PremiumPlan }) {
  const router = useRouter();
  const tone = PLAN_TONE_STYLES[plan.tone];
  const purchase = usePurchasePlan();
  const isBuying = purchase.isPending && purchase.variables === plan.key;

  const handlePress = () => {
    if (loading) return;
    Haptics.selectionAsync().catch(() => {});
    if (plan.key === 'free' || purchase.isPending) return;
    purchase.mutate(plan.key, {
      onSuccess: () => router.push({ pathname: '/premium/success', params: { plan: plan.label } }),
      onError: () => router.push('/premium/failed'),
    });
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
          <Text className="font-heading text-[8px] text-white">{plan.badge}</Text>
        </View>
      ) : null}
      <Text className="mb-1.5 text-center font-heading text-[8.5px] tracking-wide" style={{ color: tone.text }}>
        {plan.label}
      </Text>
      <Text className="mb-0.5 text-center font-display text-[22px] text-white">{plan.price}</Text>
      <Text className="mb-2 text-center font-body text-[9px] text-white/[0.38]">{plan.description}</Text>
      <Pressable
        onPress={handlePress}
        disabled={purchase.isPending}
        className="rounded-lg py-1.5"
        style={{ backgroundColor: tone.cta, opacity: purchase.isPending && !isBuying ? 0.5 : 1 }}
      >
        {isBuying ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-center font-heading text-[9px] text-white">{plan.cta}</Text>
        )}
      </Pressable>
    </View>
  );
}
