import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Calendar, Crown, ShieldCheck, Heart, ArrowLeft, UserPlus } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { colors, gradients } from '@/shared/constants/theme';

const TIERS = [
  { Icon: UserPlus, title: 'Inscription Gratuite', subtitle: 'Max 5 profils', price: '0€', priceColor: colors.ink.DEFAULT, cta: 'Commencer', ctaBg: 'rgba(44,20,8,0.07)', ctaColor: colors.ink.muted, iconBg: 'rgba(44,20,8,0.06)', highlight: false },
  { Icon: Search, title: 'Découverte Illimitée', subtitle: 'Accès illimité 24h', price: '2€', priceSuffix: '/j', priceColor: '#2860B0', cta: 'Choisir', ctaBg: 'rgba(30,100,180,0.08)', ctaColor: '#2860B0', iconBg: 'rgba(30,100,180,0.08)', highlight: false },
  { Icon: Calendar, title: '7 Jours', subtitle: 'Accès illimité', price: '5€', priceColor: '#C83030', cta: 'Choisir', ctaGradient: ['#C83030', '#8A1010'], iconBg: 'rgba(200,60,50,0.1)', highlight: true, highlightColor: 'rgba(200,60,50,0.26)' },
  { Icon: Calendar, title: '1 Mois', subtitle: '30 jours · Accès illimité', price: '15€', priceColor: '#C07010', cta: 'Choisir', ctaBg: 'rgba(200,110,20,0.1)', ctaColor: '#C07010', iconBg: 'rgba(200,110,20,0.1)', highlight: true, highlightColor: 'rgba(200,110,20,0.24)' },
  { Icon: Calendar, title: '3 Mois', subtitle: '90 jours · Accès illimité', price: '25€', priceColor: '#1A7A30', cta: 'Choisir', ctaBg: 'rgba(30,140,60,0.09)', ctaColor: '#1A7A30', iconBg: 'rgba(30,140,60,0.09)', highlight: true, highlightColor: 'rgba(30,140,60,0.2)' },
  { Icon: Crown, title: '1 An', subtitle: '365 jours · Accès illimité', price: '65€', priceColor: '#C9862A', cta: 'Choisir', ctaGradient: gradients.gold, iconBg: 'rgba(201,134,42,0.14)', highlight: true, highlightColor: 'rgba(201,134,42,0.36)', badge: 'Meilleure offre' },
] as const;

export function PremiumPricingScreen() {
  const router = useRouter();

  const handleChoose = (title: string) => {
    Haptics.selectionAsync().catch(() => {});
    router.push({ pathname: '/premium/success', params: { plan: title } });
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

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="gap-1.5">
            {TIERS.map((tier) => (
              <View
                key={tier.title}
                className="relative flex-row items-center justify-between rounded-[17px] border-[1.5px] px-4 py-3"
                style={{
                  backgroundColor: tier.highlight ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.72)',
                  borderColor: tier.highlight ? tier.highlightColor : 'rgba(255,255,255,0.9)',
                }}
              >
                {'badge' in tier ? (
                  <View className="absolute -top-2.5 right-3 rounded-full bg-brand px-2.5 py-1">
                    <Text className="font-heading text-[8.5px] uppercase text-white">{tier.badge}</Text>
                  </View>
                ) : null}
                <View className="flex-1 flex-row items-center gap-2.5">
                  <View className="h-9 w-9 items-center justify-center rounded-[11px]" style={{ backgroundColor: tier.iconBg }}>
                    <tier.Icon size={17} color={tier.priceColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-heading text-[12.5px] uppercase text-ink">{tier.title}</Text>
                    <Text className="font-body text-[10.5px] text-ink-muted">{tier.subtitle}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="mb-1 font-display text-[18px]" style={{ color: tier.priceColor }}>
                    {tier.price}
                    {'priceSuffix' in tier && tier.priceSuffix ? (
                      <Text className="font-body text-[10px] text-ink-muted">{tier.priceSuffix}</Text>
                    ) : null}
                  </Text>
                  {'ctaGradient' in tier && tier.ctaGradient ? (
                    <Pressable onPress={() => handleChoose(tier.title)}>
                      <LinearGradient colors={tier.ctaGradient as [string, string]} className="rounded-md px-2 py-1">
                        <Text className="font-heading text-[9px] uppercase text-white">{tier.cta}</Text>
                      </LinearGradient>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => handleChoose(tier.title)}
                      className="rounded-md px-2 py-1"
                      style={{ backgroundColor: 'ctaBg' in tier ? tier.ctaBg : 'transparent' }}
                    >
                      <Text className="font-heading text-[9px] uppercase" style={{ color: 'ctaColor' in tier ? tier.ctaColor : colors.ink.muted }}>
                        {tier.cta}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>

          <View className="mt-4 flex-row justify-center gap-[18px]">
            <View className="flex-row items-center gap-1.5">
              <ShieldCheck size={11} color={colors.ink.muted} />
              <Text className="font-body-medium text-[10.5px] text-ink-muted">Profils vérifiés</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Heart size={11} color={colors.ink.muted} />
              <Text className="font-body-medium text-[10.5px] text-ink-muted">Rencontres sérieuses</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
