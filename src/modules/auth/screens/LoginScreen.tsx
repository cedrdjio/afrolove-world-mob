import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { colors } from '@/shared/constants/theme';
import { loginSchema, type LoginFormValues } from '@/modules/auth/types/schemas';
import { useLogin } from '@/modules/auth/hooks/useLogin';
import { useGoogleAuth } from '@/modules/auth/hooks/useGoogleAuth';
import { useAppError } from '@/shared/hooks/useAppError';
import { BrandLogo } from '@/shared/components/ui/BrandLogo';

// Set by useAuthDeepLink when a signup/recovery email link turns out to be
// expired or already used — the user lands here instead of nowhere.
const EXPIRED_LINK_ERROR = {
  kind: 'session_expired' as const,
  title: 'Lien expiré',
  message: 'Ce lien a expiré ou a déjà été utilisé. Connectez-vous ou refaites une demande.',
  retryable: false,
};

export function LoginScreen() {
  const router = useRouter();
  const { linkError } = useLocalSearchParams<{ linkError?: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const googleAuth = useGoogleAuth();
  const loginError = useAppError(login.error);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values, { onSuccess: () => router.replace('/(auth)/resolving') });
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={280} color="rgba(106,79,192,0.12)" top={-70} right={-70} duration={9000} />
        <GlowOrb size={220} color="rgba(155,126,222,0.09)" bottom={-40} left={-40} duration={11000} delay={1500} />
      </ScreenBackground>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerClassName="px-6 pb-8" keyboardShouldPersistTaps="handled" style={{ paddingTop: 68 }}>
          <View className="mb-8 flex-row items-center justify-between">
            <IconButton onPress={() => router.back()}>
              <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
            </IconButton>
            <BrandLogo size={44} />
            <View style={{ width: 44 }} />
          </View>

          <Animated.View entering={FadeInDown.duration(420)}>
            <Text className="mb-1.5 font-display text-[34px] leading-[1.08] text-ink">Bon retour</Text>
            <Text className="mb-7 font-body text-[13px] text-ink-muted">
              Reprends là où l'histoire s'est arrêtée.
            </Text>
          </Animated.View>

          {loginError ? (
            <View className="mb-4">
              <ErrorState error={loginError} variant="inline" onRetry={handleSubmit(onSubmit)} />
            </View>
          ) : linkError ? (
            <View className="mb-4">
              <ErrorState error={EXPIRED_LINK_ERROR} variant="inline" />
            </View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(90).duration(420)}>
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
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <GlassInput
                label="Mot de passe"
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

          <View className="mb-6 items-end">
            <Text
              onPress={() => router.push('/(auth)/forgot-password')}
              className="font-body-medium text-[12.5px] text-brand"
            >
              Mot de passe oublié ?
            </Text>
          </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(420)}>
          <GradientButton
            label="Se connecter"
            loading={login.isPending}
            onPress={handleSubmit(onSubmit)}
            style={{ marginBottom: 18 }}
          />

          <View className="mb-4 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-ink/[0.08]" />
            <Text className="font-body-medium text-[11px] text-ink/[0.28]">ou continuer avec</Text>
            <View className="h-px flex-1 bg-ink/[0.08]" />
          </View>

          <Pressable
            disabled={!googleAuth.isReady || googleAuth.isPending}
            onPress={() => googleAuth.promptAsync()}
            className="mb-6 flex-row items-center justify-center gap-2 rounded-2xl border-[1.5px] border-white/70 bg-white/[0.5] py-3.5"
            style={{ opacity: googleAuth.isReady ? 1 : 0.5 }}
          >
            {googleAuth.isPending ? (
              <ActivityIndicator color={colors.brand.DEFAULT} />
            ) : (
              <>
                <Text className="text-[15px] font-bold" style={{ color: '#4285F4' }}>
                  G
                </Text>
                <Text className="font-heading-semibold text-[13px] text-ink">Continuer avec Google</Text>
              </>
            )}
          </Pressable>

          <Text className="text-center font-body text-[13px] text-ink-muted">
            Pas encore membre ?{' '}
            <Text onPress={() => router.push('/(auth)/register')} className="font-heading-semibold text-brand">
              Créer un compte
            </Text>
          </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
