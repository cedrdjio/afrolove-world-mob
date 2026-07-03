import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';

export function ReportConfirmationScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={220} color="rgba(62,155,95,0.1)" top={-40} left={-40} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-8">
        <LottieView
          source={require('@/assets/lottie/success-burst.json')}
          autoPlay
          loop={false}
          style={{ width: 150, height: 150, marginBottom: 8 }}
        />

        <Text className="mb-2.5 text-center font-display text-[26px] uppercase leading-none text-ink">
          Signalement envoyé
        </Text>
        <Text className="mb-9 text-center font-body text-[13px] leading-[20px] text-ink-muted">
          Merci de nous aider à garder AfriLove World sûr. Notre équipe va examiner ce signalement rapidement.
        </Text>

        <GradientButton label="Retour" onPress={() => router.replace('/(tabs)/discover')} style={{ width: '100%' }} />
      </View>
    </View>
  );
}
