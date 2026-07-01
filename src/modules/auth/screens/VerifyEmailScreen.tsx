import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { ScreenBackground, GlowOrb, ScreenHeader } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { OtpInput } from '@/modules/auth/components/OtpInput';
import { colors } from '@/shared/constants/theme';

export function VerifyEmailScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={260} color="rgba(201,134,42,0.11)" top={-60} left={-60} duration={9000} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 68 }}>
        <ScreenHeader />

        <View
          className="mb-5 h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-white/70"
          style={{ shadowColor: colors.brand.DEFAULT, shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 4 } }}
        >
          <MailCheck size={26} color={colors.brand.DEFAULT} strokeWidth={1.8} />
        </View>

        <Text className="mb-2.5 font-display text-[34px] uppercase leading-none text-ink">Vérifiez{'\n'}votre email</Text>
        <Text className="mb-8 font-body text-[13.5px] leading-[21px] text-ink-muted">
          Saisissez le code à 6 chiffres envoyé à votre adresse email.
        </Text>

        <OtpInput onComplete={setCode} />

        <Text className="my-6 text-center font-body text-[12.5px] text-ink-muted">
          Vous n'avez rien reçu ? <Text className="font-heading-semibold text-brand">Renvoyer le code</Text>
        </Text>

        <GradientButton
          label="Vérifier"
          disabled={code.length < 6}
          onPress={() => router.push('/(auth)/success')}
        />
      </View>
    </View>
  );
}
