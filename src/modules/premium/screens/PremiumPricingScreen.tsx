import { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Crown, Check, ArrowLeft, BadgeCheck } from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/layout';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { IconButton } from '@/shared/components/ui/IconButton';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { usePremiumPlans, useEntitlements } from '@/modules/premium/hooks/usePremium';
import { colors, gradients } from '@/shared/constants/theme';

const FEATURES = [
  'Likes illimités chaque jour',
  'Vois qui t’a déjà liké',
  'Super likes et filtres avancés',
];

/** Plan mis en avant par défaut (le "POPULAIRE" de la maquette). */
const DEFAULT_PLAN_KEY = 'month_1m';
/** Plan qui porte le badge "Meilleure offre". */
const BEST_PLAN_KEY = 'year_1y';

function formatPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  const symbol = currency === 'EUR' ? '€' : ` ${currency}`;
  return `${Number.isInteger(amount) ? amount : amount.toFixed(2)}${symbol}`;
}

function durationLabel(days: number): string {
  if (days === 1) return '24 heures';
  if (days < 30) return `${days} jours`;
  if (days < 365) return `${Math.round(days / 30)} mois`;
  return '1 an';
}

/** Écran tarifs façon maquette 15 — fond nuit, couronne, avantages cochés,
 *  cartes de plans sélectionnables et CTA gradient unique. */
export function PremiumPricingScreen() {
  const router = useRouter();
  const plansQuery = usePremiumPlans();
  const entitlements = useEntitlements();
  const [selected, setSelected] = useState<string | null>(null);

  const plans = plansQuery.data ?? [];
  const selectedKey =
    selected ?? plans.find((p) => p.key === DEFAULT_PLAN_KEY)?.key ?? plans[0]?.key ?? null;
  const selectedPlan = plans.find((p) => p.key === selectedKey) ?? null;

  // Le choix du forfait mène à l'écran de paiement (saisie du numéro Mobile
  // Money, détection de l'opérateur, puis lancement CamerPay).
  const handleContinue = () => {
    if (!selectedPlan) return;
    Haptics.selectionAsync().catch(() => {});
    router.push({
      pathname: '/premium/checkout',
      params: { plan: selectedPlan.key, label: selectedPlan.label },
    });
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep" />

      <View className="flex-1 px-6" style={{ paddingTop: 60, paddingBottom: 24 }}>
        <View className="flex-row items-center justify-between">
          <IconButton variant="dark" onPress={() => router.back()}>
            <ArrowLeft size={19} color="#fff" strokeWidth={2} />
          </IconButton>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <Animated.View entering={FadeInDown.duration(350)} className="items-center pt-2">
            <LinearGradient
              colors={gradients.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                shadowColor: '#9B7EDE',
                shadowOpacity: 0.45,
                shadowRadius: 26,
                shadowOffset: { width: 0, height: 12 },
                elevation: 8,
              }}
            >
              <Crown size={32} color="#fff" strokeWidth={1.8} />
            </LinearGradient>
            <Text className="mb-1 font-display text-[28px] text-white">AfriLove Premium</Text>
            <Text className="mb-6 font-body text-[13px] text-white/60">Rencontre sans limites</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(350)} className="mb-6 gap-2.5">
            {FEATURES.map((feature) => (
              <View key={feature} className="flex-row items-center gap-3">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-gold/25">
                  <Check size={13} color={colors.gold.light} strokeWidth={3} />
                </View>
                <Text className="font-body-medium text-[13.5px] text-white/85">{feature}</Text>
              </View>
            ))}
          </Animated.View>

          {entitlements.data?.isPremium ? (
            <GlassSurface variant="dark" radius={18} style={{ marginBottom: 14 }}>
              <View className="flex-row items-center gap-2 px-4 py-3">
                <BadgeCheck size={15} color={colors.gold.light} strokeWidth={2.4} />
                <Text className="flex-1 font-body text-[12px] leading-[17px] text-white/85">
                  Premium actif ({entitlements.data.planLabel}) jusqu'au{' '}
                  {entitlements.data.premiumUntil
                    ? new Date(entitlements.data.premiumUntil).toLocaleDateString('fr-FR')
                    : '—'}
                  . Un nouvel achat prolonge cette durée.
                </Text>
              </View>
            </GlassSurface>
          ) : null}

          {plansQuery.isLoading ? (
            <View className="items-center py-14">
              <ActivityIndicator size="large" color={colors.gold.DEFAULT} />
            </View>
          ) : (
            <Animated.View
              entering={FadeInDown.delay(160).duration(350)}
              className="flex-row flex-wrap justify-center gap-2.5"
            >
              {plans.map((plan) => {
                const isSelected = plan.key === selectedKey;
                const isBest = plan.key === BEST_PLAN_KEY;
                return (
                  <Pressable
                    key={plan.key}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setSelected(plan.key);
                    }}
                    style={{ width: '31%' }}
                  >
                    <View
                      className="relative items-center rounded-[20px] px-2 pb-3.5 pt-4"
                      style={{
                        backgroundColor: isSelected ? 'rgba(155,126,222,0.22)' : 'rgba(255,255,255,0.07)',
                        borderWidth: 1.5,
                        borderColor: isSelected ? colors.gold.DEFAULT : 'rgba(255,255,255,0.16)',
                        shadowColor: isSelected ? '#9B7EDE' : 'transparent',
                        shadowOpacity: isSelected ? 0.4 : 0,
                        shadowRadius: 18,
                        shadowOffset: { width: 0, height: 8 },
                        elevation: isSelected ? 6 : 0,
                      }}
                    >
                      {isBest ? (
                        <View
                          className="absolute self-center rounded-full px-2.5 py-1"
                          style={{ top: -10, backgroundColor: colors.gold.DEFAULT }}
                        >
                          <Text className="font-heading text-[8px] text-white">Meilleure offre</Text>
                        </View>
                      ) : null}
                      <Text className="mb-1.5 font-heading text-[10px] text-white/60">
                        {durationLabel(plan.durationDays)}
                      </Text>
                      <Text className="mb-0.5 font-display text-[21px] text-white">
                        {formatPrice(plan.priceCents, plan.currency)}
                      </Text>
                      <Text className="text-center font-body text-[9px] leading-[13px] text-white/[0.42]">
                        {plan.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </Animated.View>
          )}

          <Text className="mt-5 text-center font-body text-[10.5px] leading-[15px] text-white/[0.35]">
            Sans engagement · les achats prolongent la durée Premium en cours.{'\n'}
            www.afriloveworld.com · +33 6 98 89 19 75
          </Text>
        </ScrollView>

        <GradientButton
          label={
            selectedPlan
              ? `Continuer — ${formatPrice(selectedPlan.priceCents, selectedPlan.currency)}`
              : 'Continuer'
          }
          disabled={!selectedPlan}
          onPress={handleContinue}
          style={{ marginTop: 14 }}
        />
      </View>
    </View>
  );
}
