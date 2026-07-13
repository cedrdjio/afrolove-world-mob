import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Heart, Eye, Star, Zap, Globe2, Crown, BadgeCheck } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { PricingCard } from '@/modules/premium/components/PricingCard';
import { BEST_PLAN_KEY } from '@/modules/premium/constants/plans';
import { usePremiumPlans, useEntitlements } from '@/modules/premium/hooks/usePremium';
import type { PremiumPlan } from '@/modules/premium/services/premiumService';
import { colors } from '@/shared/constants/theme';

const FEATURES = [
  { Icon: Heart, label: 'Likes et swipes illimités' },
  { Icon: Eye, label: 'Voir qui vous a aimé' },
  { Icon: Star, label: 'Super Like × 5 / jour' },
  { Icon: Zap, label: 'Favoris illimités' },
  { Icon: Globe2, label: 'Filtres avancés' },
];

export function PremiumLandingScreen() {
  const router = useRouter();
  const plansQuery = usePremiumPlans();
  const entitlements = useEntitlements();

  const plans = plansQuery.data ?? [];
  const isPremium = entitlements.data?.isPremium ?? false;

  // Le choix d'un forfait mène à l'écran de paiement (numéro Mobile Money +
  // opérateur), qui lance CamerPay et route vers succès / échec.
  const handleChoose = (plan: PremiumPlan) => {
    router.push({
      pathname: '/premium/checkout',
      params: { plan: plan.key, label: plan.label },
    });
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={300} color="rgba(155,126,222,0.18)" top={90} left={45} duration={9000} />
      </ScreenBackground>

      <ScrollView contentContainerClassName="px-6 pb-8" style={{ paddingTop: 62 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} className="mb-[18px] self-end">
          <View className="h-[38px] w-[38px] items-center justify-center rounded-full border border-white/20 bg-white/[0.12]">
            <X size={16} color="rgba(255,255,255,0.55)" />
          </View>
        </Pressable>

        <View className="mb-[26px] items-center">
          <View style={{ marginBottom: 12 }}>
            <Crown size={40} color={colors.gold.DEFAULT} strokeWidth={1.6} />
          </View>
          <Text className="text-center font-display-black text-[38px] leading-none text-white">
            AfriLove{'\n'}
            <Text className="text-gold">Premium</Text>
          </Text>
          {!isPremium ? (
            <View className="mt-3 rounded-full border border-gold/40 bg-gold/[0.22] px-4 py-2">
              <Text className="font-heading text-[11px] text-gold">7 jours gratuits</Text>
            </View>
          ) : null}
        </View>

        {/* Abonnement déjà actif : on l'affiche clairement au lieu de
            redemander un forfait comme si l'utilisateur n'avait rien. */}
        {isPremium ? (
          <View className="mb-[18px] flex-row items-center gap-3 rounded-2xl border border-gold/40 bg-gold/[0.16] px-4 py-3.5">
            <BadgeCheck size={18} color={colors.gold.DEFAULT} strokeWidth={2.2} />
            <View className="flex-1">
              <Text className="mb-0.5 font-heading text-[12px] text-gold">
                Premium actif — {entitlements.data?.planLabel ?? ''}
              </Text>
              <Text className="font-body text-[11.5px] leading-[16px] text-white/60">
                Valable jusqu'au{' '}
                {entitlements.data?.premiumUntil
                  ? new Date(entitlements.data.premiumUntil).toLocaleDateString('fr-FR')
                  : '—'}
                . Un nouvel achat prolonge cette durée.
              </Text>
            </View>
          </View>
        ) : null}

        <View className="mb-[18px] gap-3.5 rounded-3xl border border-white/[0.18] bg-white/[0.1] p-5">
          {FEATURES.map((feature) => (
            <View key={feature.label} className="flex-row items-center gap-3.5">
              <View className="h-[30px] w-[30px] items-center justify-center rounded-lg bg-gold/[0.22]">
                <feature.Icon size={15} color="#9B7EDE" />
              </View>
              <Text className="font-heading-semibold text-[13px] text-white/90">{feature.label}</Text>
            </View>
          ))}
        </View>

        {/* Abonné : les forfaits deviennent des options de prolongation /
            upgrade (chaque achat s'ajoute à la durée en cours). */}
        {isPremium ? (
          <Text className="mb-2.5 font-heading text-[11.5px] text-white/50">
            Prolonger ou changer de forfait
          </Text>
        ) : null}

        {plansQuery.isLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color={colors.gold.DEFAULT} />
          </View>
        ) : (
          <View className="mb-3.5 flex-row flex-wrap gap-1.5">
            {plans.map((plan) => (
              <View key={plan.key} style={{ width: '31.5%' }}>
                <PricingCard
                  plan={plan}
                  onChoose={handleChoose}
                  badge={plan.key === BEST_PLAN_KEY ? 'Meilleur' : undefined}
                />
              </View>
            ))}
          </View>
        )}

        <Pressable onPress={() => router.push('/premium/pricing')} className="mb-3 active:opacity-80">
          <Text className="text-center font-heading text-[11px] uppercase text-white/50">
            Comparer tous les forfaits
          </Text>
        </Pressable>

        <Text className="text-center font-body text-[10px] text-white/25">
          www.afriloveworld.com · +33 6 98 89 19 75
        </Text>
      </ScrollView>
    </View>
  );
}
