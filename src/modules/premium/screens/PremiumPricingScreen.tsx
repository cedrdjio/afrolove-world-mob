import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search, Calendar, Crown, ArrowLeft, UserPlus, BadgeCheck } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useAppError } from '@/shared/hooks/useAppError';
import { usePremiumPlans, usePurchasePlan, useEntitlements } from '@/modules/premium/hooks/usePremium';
import { colors, gradients } from '@/shared/constants/theme';

/** Visual identity per plan key — the data (label, price, duration) comes
 *  from the premium_plans table so the dashboard can change offers without
 *  an app release. Unknown keys fall back to the last style. */
const TIER_STYLES: Record<
  string,
  { Icon: LucideIcon; color: string; iconBg: string; highlight?: string; gradient?: readonly [string, string]; badge?: string }
> = {
  discovery_1d: { Icon: Search, color: '#2860B0', iconBg: 'rgba(30,100,180,0.08)' },
  week_7d: { Icon: Calendar, color: '#C83030', iconBg: 'rgba(200,60,50,0.1)', highlight: 'rgba(200,60,50,0.26)', gradient: ['#C83030', '#8A1010'] },
  month_1m: { Icon: Calendar, color: '#C07010', iconBg: 'rgba(200,110,20,0.1)', highlight: 'rgba(200,110,20,0.24)' },
  quarter_3m: { Icon: Calendar, color: '#1A7A30', iconBg: 'rgba(30,140,60,0.09)', highlight: 'rgba(30,140,60,0.2)' },
  year_1y: { Icon: Crown, color: '#C9862A', iconBg: 'rgba(201,134,42,0.14)', highlight: 'rgba(201,134,42,0.36)', gradient: gradients.gold, badge: 'Meilleure offre' },
};

function formatPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  const symbol = currency === 'EUR' ? '€' : ` ${currency}`;
  return `${Number.isInteger(amount) ? amount : amount.toFixed(2)}${symbol}`;
}

export function PremiumPricingScreen() {
  const router = useRouter();
  const plansQuery = usePremiumPlans();
  const entitlements = useEntitlements();
  const purchase = usePurchasePlan();
  const purchaseError = useAppError(purchase.error);

  const plans = plansQuery.data ?? [];

  const handleChoose = (planKey: string, planLabel: string) => {
    if (purchase.isPending) return;
    Haptics.selectionAsync().catch(() => {});
    purchase.mutate(planKey, {
      onSuccess: () => router.push({ pathname: '/premium/success', params: { plan: planLabel } }),
      onError: () => router.push('/premium/failed'),
    });
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={210} color="rgba(200,96,64,0.09)" top={-40} right={-40} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 60, paddingBottom: 20 }}>
        <View className="mb-[18px] flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
          </IconButton>
          <View className="items-center">
            <Text className="font-display text-[22px] uppercase text-ink">Nos Tarifs</Text>
            <Text className="mt-0.5 font-body text-[10.5px] text-ink-muted">Des offres pour chaque besoin</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {entitlements.data?.isPremium ? (
          <View className="mb-3 flex-row items-center gap-2 rounded-2xl border border-gold/25 bg-gold/[0.08] px-4 py-3">
            <BadgeCheck size={15} color={colors.gold.DEFAULT} strokeWidth={2.4} />
            <Text className="flex-1 font-body text-[12px] leading-[17px] text-ink">
              Premium actif ({entitlements.data.planLabel}) jusqu'au{' '}
              {entitlements.data.premiumUntil
                ? new Date(entitlements.data.premiumUntil).toLocaleDateString('fr-FR')
                : '—'}
              . Un nouvel achat prolonge cette durée.
            </Text>
          </View>
        ) : null}

        {purchaseError ? (
          <View className="mb-3">
            <ErrorState error={purchaseError} variant="inline" />
          </View>
        ) : null}

        {plansQuery.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="gap-1.5">
              <View
                className="flex-row items-center justify-between rounded-[17px] border-[1.5px] border-white/90 px-4 py-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.72)' }}
              >
                <View className="flex-1 flex-row items-center gap-2.5">
                  <View className="h-9 w-9 items-center justify-center rounded-[11px]" style={{ backgroundColor: 'rgba(44,20,8,0.06)' }}>
                    <UserPlus size={17} color={colors.ink.DEFAULT} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-heading text-[12.5px] uppercase text-ink">Inscription Gratuite</Text>
                    <Text className="font-body text-[10.5px] text-ink-muted">5 likes par jour</Text>
                  </View>
                </View>
                <Text className="font-display text-[18px] text-ink">0€</Text>
              </View>

              {plans.map((plan, index) => {
                const style = TIER_STYLES[plan.key] ?? TIER_STYLES.year_1y;
                return (
                  <Animated.View
                    key={plan.key}
                    entering={FadeInDown.delay(index * 60).springify().damping(17)}
                  >
                    <View
                      className="relative flex-row items-center justify-between rounded-[17px] border-[1.5px] px-4 py-3"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.72)',
                        borderColor: style.highlight ?? 'rgba(255,255,255,0.9)',
                      }}
                    >
                      {style.badge ? (
                        <View className="absolute -top-2.5 right-3 rounded-full bg-brand px-2.5 py-1">
                          <Text className="font-heading text-[8.5px] uppercase text-white">{style.badge}</Text>
                        </View>
                      ) : null}
                      <View className="flex-1 flex-row items-center gap-2.5">
                        <View className="h-9 w-9 items-center justify-center rounded-[11px]" style={{ backgroundColor: style.iconBg }}>
                          <style.Icon size={17} color={style.color} />
                        </View>
                        <View className="flex-1">
                          <Text className="font-heading text-[12.5px] uppercase text-ink">{plan.label}</Text>
                          <Text className="font-body text-[10.5px] text-ink-muted">{plan.description}</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="mb-1 font-display text-[18px]" style={{ color: style.color }}>
                          {formatPrice(plan.priceCents, plan.currency)}
                          {plan.durationDays === 1 ? (
                            <Text className="font-body text-[10px] text-ink-muted">/j</Text>
                          ) : null}
                        </Text>
                        <Pressable onPress={() => handleChoose(plan.key, plan.label)} disabled={purchase.isPending}>
                          {style.gradient ? (
                            <LinearGradient colors={style.gradient as [string, string]} className="rounded-md px-2 py-1">
                              <Text className="font-heading text-[9px] uppercase text-white">
                                {purchase.isPending && purchase.variables === plan.key ? '…' : 'Choisir'}
                              </Text>
                            </LinearGradient>
                          ) : (
                            <View className="rounded-md px-2 py-1" style={{ backgroundColor: style.iconBg }}>
                              <Text className="font-heading text-[9px] uppercase" style={{ color: style.color }}>
                                {purchase.isPending && purchase.variables === plan.key ? '…' : 'Choisir'}
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      </View>
                    </View>
                  </Animated.View>
                );
              })}
            </View>

            <Text className="mt-4 text-center font-body text-[10.5px] leading-[15px] text-ink/35">
              Paiement sécurisé. Les achats prolongent la durée Premium en cours.{'\n'}
              www.afriloveworld.com · +33 6 98 89 19 75
            </Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
