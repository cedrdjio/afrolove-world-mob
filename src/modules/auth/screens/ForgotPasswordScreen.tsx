import { useEffect, useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, KeyRound } from 'lucide-react-native';
import { ScreenBackground, GlowOrb, ScreenHeader } from '@/shared/components/layout';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { OtpInput } from '@/modules/auth/components/OtpInput';
import { colors } from '@/shared/constants/theme';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/modules/auth/types/schemas';
import { useForgotPassword, useVerifyRecoveryOtp } from '@/modules/auth/hooks/useForgotPassword';
import { useAppError } from '@/shared/hooks/useAppError';

const MIN_CODE_LENGTH = 4;

/**
 * Réinitialisation en deux temps, entièrement dans l'app : envoi de l'email,
 * puis saisie du code qu'il contient (verifyOtp type recovery). Le lien de
 * l'email reste un raccourci pour ceux dont le retour app fonctionne, mais le
 * flux ne dépend plus de lui — c'était la cause du parcours bloqué sur mobile.
 */
export function ForgotPasswordScreen() {
  const router = useRouter();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState('');
  // GoTrue limite les renvois à un par minute — inutile de tirer avant.
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const forgotPassword = useForgotPassword();
  const verifyOtp = useVerifyRecoveryOtp();
  const forgotPasswordError = useAppError(forgotPassword.error);
  const verifyError = useAppError(verifyOtp.error);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPassword.mutate(values.email, {
      onSuccess: () => {
        setSentTo(values.email);
        setResendCooldown(60);
      },
    });
  };

  const handleVerify = () => {
    if (!sentTo || code.length < MIN_CODE_LENGTH) return;
    verifyOtp.mutate(
      { email: sentTo, token: code },
      { onSuccess: () => router.replace('/(auth)/reset-password') },
    );
  };

  const handleResend = () => {
    if (!sentTo || resendCooldown > 0) return;
    forgotPassword.mutate(sentTo, {
      onSuccess: () => {
        // Un renvoi invalide le code précédent — on efface la saisie.
        setCode('');
        setResendCount((n) => n + 1);
        setResendCooldown(60);
      },
    });
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={260} color="rgba(106,79,192,0.11)" top={-60} right={-60} duration={9500} />
      </ScreenBackground>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View className="flex-1 px-6" style={{ paddingTop: 68 }}>
          <ScreenHeader />

          <View
            className="mb-5 h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-white/[0.55]"
            style={{ shadowColor: colors.brand.DEFAULT, shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 4 } }}
          >
            <KeyRound size={26} color={colors.brand.DEFAULT} strokeWidth={1.8} />
          </View>

          {sentTo ? (
            <>
              <Text className="mb-2.5 font-display text-[34px] leading-none text-ink">
                Vérifiez vos{'\n'}emails
              </Text>

              {verifyError ? (
                <View className="mb-4">
                  <ErrorState error={verifyError} variant="inline" onRetry={handleVerify} />
                </View>
              ) : forgotPasswordError ? (
                <View className="mb-4">
                  <ErrorState error={forgotPasswordError} variant="inline" onRetry={handleResend} />
                </View>
              ) : null}

              <OtpInput key={resendCount} onComplete={setCode} />

              <Text className="my-6 text-center font-body text-[12.5px] text-ink-muted">
                {resendCooldown > 0
                  ? `Email envoyé ! Nouvel envoi possible dans ${resendCooldown}s`
                  : forgotPassword.isPending
                    ? 'Envoi en cours…'
                    : (
                      <>
                        Vous n'avez rien reçu ?{' '}
                        <Text onPress={handleResend} className="font-heading-semibold text-brand">
                          Renvoyer l'email
                        </Text>
                      </>
                    )}
              </Text>

              <GradientButton
                label="Valider le code"
                disabled={code.length < MIN_CODE_LENGTH}
                loading={verifyOtp.isPending}
                onPress={handleVerify}
              />
            </>
          ) : (
            <>
              <Text className="mb-2.5 font-display text-[34px] leading-none text-ink">
                Mot de passe{'\n'}oublié ?
              </Text>
              <Text className="mb-7 font-body text-[13.5px] leading-[21px] text-ink-muted">
                Indiquez votre email : nous vous enverrons un code de réinitialisation à saisir dans
                l'application.
              </Text>
              {forgotPasswordError ? (
                <View className="mb-4">
                  <ErrorState error={forgotPasswordError} variant="inline" onRetry={handleSubmit(onSubmit)} />
                </View>
              ) : null}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <GlassInput
                    label="Email"
                    icon={<Mail size={16} color="rgba(62,53,82,0.28)" />}
                    placeholder="Adresse email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />
              <View className="mt-2" />
              <GradientButton label="Envoyer le code" loading={forgotPassword.isPending} onPress={handleSubmit(onSubmit)} />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
