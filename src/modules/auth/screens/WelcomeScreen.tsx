import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { BrandLogo } from '@/shared/components/ui/BrandLogo';
import { images } from '@/shared/constants/images';

/** Maquette 01 — Accueil : photo plein écran, pastille logo en haut,
 *  carte de verre en bas avec titre, sous-titre et CTA. */
export function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-deep">
      <Image
        source={images.welcomeHero}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />
      {/* Scrim aubergine — lisibilité de la carte sans sortir de la charte. */}
      <LinearGradient
        colors={['rgba(24,15,42,0.30)', 'transparent', 'rgba(34,25,55,0.45)', 'rgba(24,15,42,0.92)']}
        locations={[0, 0.28, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View className="absolute inset-x-0 top-16 items-start px-6">
        <GlassSurface variant="dark" radius={999}>
          <View className="flex-row items-center gap-2 px-4 py-2">
            <BrandLogo size={22} variant="plain" />
            <Text className="font-display-semibold text-[13px] tracking-wide text-white">
              AfriLove World
            </Text>
          </View>
        </GlassSurface>
      </View>

      <View className="flex-1 justify-end px-5 pb-8">
        <GlassSurface variant="dark" radius={28}>
          <View className="px-6 pb-6 pt-7">
            <Text className="mb-2.5 font-display text-[30px] leading-[1.12] text-white">
              Rencontrez le{'\n'}monde entier
            </Text>
            <Text className="mb-6 font-body text-[13.5px] leading-[21px] text-white/75">
              Des rencontres afro-européennes sincères, portées par la culture et le cœur.
            </Text>
            <GradientButton
              label="Créer mon compte"
              onPress={() => router.push('/(auth)/register')}
              style={{ marginBottom: 16 }}
            />
            <Text className="text-center font-body text-[13px] text-white/70">
              Déjà membre ?{' '}
              <Text
                onPress={() => router.push('/(auth)/login')}
                className="font-heading-semibold text-white"
              >
                Se connecter
              </Text>
            </Text>
          </View>
        </GlassSurface>
      </View>
    </View>
  );
}
