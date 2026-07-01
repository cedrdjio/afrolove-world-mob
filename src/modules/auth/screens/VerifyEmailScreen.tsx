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
import { useAppError } from '@/shared/hooks/useAppError';

export function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [resendConfirmed, setResendConfirmed] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const verifyOtp = useVerifySignupOtp();
  const resendEmail = useResendSignupEmail();
  const verifyError = useAppError(verifyOtp.error);

  const MIN_CODE_LENGTH = 4;
  const handleVerify = () => {
    if (!email || code.length < MIN_CODE_LENGTH) return;
    verifyOtp.mutate({ email, token: code }, { onSuccess: () => router.replace('/(auth)/success') });
  };

  const handleResend = () => {
    if (!email) return;
    resendEmail.mutate(email, {
      onSuccess: () => {
        // Resending invalidates the previous code, so clear whatever the
        // user already typed — submitting it now would just fail with
        // "Token has expired or is invalid" instead of the new one.
        setCode('');
        setResendCount((n) => n + 1);
        setResendConfirmed(true);
      },
    });
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
          Saisissez le code envoyé à {email ?? 'votre adresse email'}, ou ouvrez directement le lien reçu par
          email.
        </Text>

        {verifyError ? (
          <View className="mb-5">
            <ErrorState error={verifyError} variant="inline" onRetry={handleVerify} />
          </View>
        ) : null}

        <OtpInput key={resendCount} onComplete={setCode} />

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
          disabled={code.length < MIN_CODE_LENGTH}
          loading={verifyOtp.isPending}
          onPress={handleVerify}
        />
      </View>
    </View>
  );
}
