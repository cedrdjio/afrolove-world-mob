import { useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { ScreenBackground, GlowOrb, ScreenHeader } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { OtpInput } from '@/modules/auth/components/OtpInput';
import { colors } from '@/shared/constants/theme';
import { useVerifySignupOtp, useResendSignupEmail } from '@/modules/auth/hooks/useVerifyEmail';
import { mapToAppError } from '@/shared/utils/errorMapping';

export function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [resendConfirmed, setResendConfirmed] = useState(false);
  const verifyOtp = useVerifySignupOtp();
  const resendEmail = useResendSignupEmail();

  const handleVerify = () => {
    if (!email || code.length < 6) return;
    verifyOtp.mutate({ email, token: code }, { onSuccess: () => router.replace('/(auth)/success') });
  };

  const handleResend = () => {
    if (!email) return;
    resendEmail.mutate(email, { onSuccess: () => setResendConfirmed(true) });
  };

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
          Saisissez le code à 6 chiffres envoyé à {email ?? 'votre adresse email'}, ou ouvrez directement le lien
          reçu par email.
        </Text>

        {verifyOtp.isError ? (
          <View className="mb-5">
            <ErrorState error={mapToAppError(verifyOtp.error)} variant="inline" onRetry={handleVerify} />
          </View>
        ) : null}

        <OtpInput onComplete={setCode} />

        <Text className="my-6 text-center font-body text-[12.5px] text-ink-muted">
          {resendConfirmed
            ? 'Code renvoyé !'
            : resendEmail.isPending
              ? 'Envoi en cours…'
              : (
                <>
                  Vous n'avez rien reçu ?{' '}
                  <Text onPress={handleResend} className="font-heading-semibold text-brand">
                    Renvoyer le code
                  </Text>
                </>
              )}
        </Text>

        <GradientButton
          label="Vérifier"
          disabled={code.length < 6}
          loading={verifyOtp.isPending}
          onPress={handleVerify}
        />
      </View>
    </View>
  );
}
