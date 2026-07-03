import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { colors } from '@/shared/constants/theme';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/modules/auth/types/schemas';
import { useResetPassword } from '@/modules/auth/hooks/useResetPassword';
import { useAppError } from '@/shared/hooks/useAppError';

export function ResetPasswordScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const resetPassword = useResetPassword();
  const resetPasswordError = useAppError(resetPassword.error);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    resetPassword.mutate(values.password, {
      onSuccess: () => router.replace('/(auth)/success'),
    });
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={260} color="rgba(106,79,192,0.11)" top={-60} right={-60} duration={9500} />
      </ScreenBackground>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View className="flex-1 px-6" style={{ paddingTop: 68 }}>
          <View
            className="mb-5 h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-white/70"
            style={{ shadowColor: colors.brand.DEFAULT, shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 4 } }}
          >
            <Lock size={26} color={colors.brand.DEFAULT} strokeWidth={1.8} />
          </View>

          <Text className="mb-2.5 font-display text-[34px] uppercase leading-none text-ink">
            Nouveau mot{'\n'}de passe
          </Text>
          <Text className="mb-7 font-body text-[13.5px] leading-[21px] text-ink-muted">
            Choisissez un nouveau mot de passe pour votre compte.
          </Text>

          {resetPasswordError ? (
            <View className="mb-4">
              <ErrorState error={resetPasswordError} variant="inline" onRetry={handleSubmit(onSubmit)} />
            </View>
          ) : null}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <GlassInput
                label="Nouveau mot de passe"
                icon={<Lock size={16} color="rgba(62,53,82,0.28)" />}
                placeholder="••••••••••"
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                rightIcon={
                  showPassword ? (
                    <EyeOff size={15} color="rgba(62,53,82,0.22)" />
                  ) : (
                    <Eye size={15} color="rgba(62,53,82,0.22)" />
                  )
                }
                onRightIconPress={() => setShowPassword((v) => !v)}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <GlassInput
                label="Confirmer le mot de passe"
                icon={<Lock size={16} color="rgba(62,53,82,0.28)" />}
                placeholder="••••••••••"
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <View className="mt-2" />
          <GradientButton
            label="Mettre à jour"
            loading={resetPassword.isPending}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
