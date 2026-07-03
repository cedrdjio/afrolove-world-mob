import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, KeyRound } from 'lucide-react-native';
import { ScreenBackground, GlowOrb, ScreenHeader } from '@/shared/components/layout';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { colors } from '@/shared/constants/theme';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/modules/auth/types/schemas';
import { useForgotPassword } from '@/modules/auth/hooks/useForgotPassword';
import { useAppError } from '@/shared/hooks/useAppError';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const forgotPassword = useForgotPassword();
  const forgotPasswordError = useAppError(forgotPassword.error);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPassword.mutate(values.email, { onSuccess: () => setSent(true) });
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
            className="mb-5 h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-white/70"
            style={{ shadowColor: colors.brand.DEFAULT, shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 4 } }}
          >
            <KeyRound size={26} color={colors.brand.DEFAULT} strokeWidth={1.8} />
          </View>

          {sent ? (
            <>
              <Text className="mb-2.5 font-display text-[34px] uppercase leading-none text-ink">
                Vérifiez vos{'\n'}emails
              </Text>
              <Text className="mb-8 font-body text-[13.5px] leading-[21px] text-ink-muted">
                Un lien de réinitialisation vient de vous être envoyé. Consultez votre boîte de réception.
              </Text>
              <GradientButton label="Retour à la connexion" onPress={() => router.replace('/(auth)/login')} />
            </>
          ) : (
            <>
              <Text className="mb-2.5 font-display text-[34px] uppercase leading-none text-ink">
                Mot de passe{'\n'}oublié ?
              </Text>
              <Text className="mb-7 font-body text-[13.5px] leading-[21px] text-ink-muted">
                Indiquez votre email, nous vous enverrons un lien de réinitialisation.
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
              <GradientButton label="Envoyer le lien" loading={forgotPassword.isPending} onPress={handleSubmit(onSubmit)} />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
