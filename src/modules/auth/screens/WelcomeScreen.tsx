import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { GhostButton } from '@/shared/components/ui/GhostButton';
import { GlowOrb } from '@/shared/components/layout';
import { BrandLogo } from '@/shared/components/ui/BrandLogo';

export function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      {/* Warm sunset-toned hero — no source photo asset available yet, so the
          mood is carried by a rich gradient wash + glows instead. */}
      <LinearGradient
        colors={['#E0A94A', '#6A4FC0', '#3A140A']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ position: 'absolute', inset: 0 }}
      />
      <GlowOrb size={280} color="rgba(255,255,255,0.1)" top={80} left={-40} duration={9000} />
      <GlowOrb size={220} color="rgba(155,126,222,0.2)" bottom={280} right={-30} duration={11000} delay={1500} />
      <LinearGradient
        colors={['rgba(10,4,2,0.35)', 'transparent', 'transparent', 'rgba(24,15,42,0.94)']}
        locations={[0, 0.32, 0.42, 1]}
        style={{ position: 'absolute', inset: 0 }}
      />

      <View className="flex-1 justify-end px-6 pb-9">
        <View className="mb-4 flex-row items-center gap-2 self-start rounded-full border border-white/[0.22] bg-white/[0.12] px-3.5 py-2">
          <BrandLogo size={22} variant="plain" />
          <Text className="font-display-semibold text-[14px] uppercase tracking-wide text-white">
            AfriLove World
          </Text>
        </View>
        <Text className="mb-2.5 font-display text-[34px] uppercase leading-[1.15] text-white">
          L'amour ancré dans{'\n'}
          <Text className="text-gold">vos valeurs</Text>
        </Text>
        <Text className="mb-5 font-body text-[13px] leading-[20px] text-white/65">
          Rejoignez la communauté premium qui unit{'\n'}la diaspora africaine à travers le monde.
        </Text>
        <GradientButton
          label="Créer un compte"
          onPress={() => router.push('/(auth)/register')}
          style={{ marginBottom: 12 }}
        />
        <GhostButton label="Se connecter" tone="onDark" onPress={() => router.push('/(auth)/login')} />
      </View>
    </View>
  );
}
