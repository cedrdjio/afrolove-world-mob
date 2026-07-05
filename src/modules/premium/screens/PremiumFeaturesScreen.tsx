import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Eye, Star, Zap, Globe2, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { colors } from '@/shared/constants/theme';

const FEATURES = [
  { Icon: Heart, title: 'Likes illimités', description: 'Aimez autant de profils que vous voulez, sans limite quotidienne.' },
  { Icon: Eye, title: 'Voir qui vous a aimé', description: 'Découvrez immédiatement les profils qui vous ont déjà liké.' },
  { Icon: Star, title: 'Super Like × 5 / jour', description: 'Démarquez-vous auprès des profils qui vous plaisent le plus.' },
  { Icon: Zap, title: 'Boost profil mensuel', description: 'Soyez mis en avant pendant 30 minutes chaque mois.' },
  { Icon: Globe2, title: 'Filtres avancés', description: 'Affinez votre recherche par religion, éducation, langues et plus.' },
  { Icon: ShieldCheck, title: 'Badge vérifié prioritaire', description: 'Traitement prioritaire de votre vérification de profil.' },
];

export function PremiumFeaturesScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={220} color="rgba(155,126,222,0.1)" top={-50} right={-50} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 68, paddingBottom: 28 }}>
        <View className="mb-6 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
          </IconButton>
          <Text className="font-display text-[20px] text-ink">Avantages Premium</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="gap-3">
            {FEATURES.map((feature) => (
              <View
                key={feature.title}
                className="flex-row items-start gap-3.5 rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45] px-4 py-4"
              >
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-gold/[0.12]">
                  <feature.Icon size={18} color={colors.gold.DEFAULT} />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 font-heading text-[14px] text-ink">{feature.title}</Text>
                  <Text className="font-body text-[12px] leading-[18px] text-ink-muted">{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <GradientButton label="Voir les tarifs" onPress={() => router.push('/premium/pricing')} style={{ marginTop: 16 }} />
      </View>
    </View>
  );
}
