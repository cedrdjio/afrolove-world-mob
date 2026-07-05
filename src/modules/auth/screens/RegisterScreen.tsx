import { useEffect, useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useLegalConsentStore } from '@/modules/legal/stores/legalConsentStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, Check, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { colors, gradients } from '@/shared/constants/theme';
import { registerSchema, type RegisterFormValues } from '@/modules/auth/types/schemas';
import { useRegister } from '@/modules/auth/hooks/useRegister';
import { useAppError } from '@/shared/hooks/useAppError';
import { BrandLogo } from '@/shared/components/ui/BrandLogo';

export function RegisterScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const register = useRegister();
  const registerError = useAppError(register.error);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', acceptedTerms: false as unknown as true },
  });

  const accepted = watch('acceptedTerms');
  const acceptedFromModal = useLegalConsentStore((s) => s.acceptedFromModal);
  const setAcceptedFromModal = useLegalConsentStore((s) => s.setAcceptedFromModal);

  // "J'ai lu et j'accepte" inside the CGU/privacy modal checks the box here.
  useEffect(() => {
    if (acceptedFromModal) {
      setValue('acceptedTerms', true as const, { shouldValidate: true });
      setAcceptedFromModal(false);
    }
  }, [acceptedFromModal, setValue, setAcceptedFromModal]);

  const onSubmit = (values: RegisterFormValues) => {
    register.mutate({ email: values.email, password: values.password }, {
      onSuccess: (data) => {
        // If email confirmation is disabled on the project, signUp returns a
        // live session — the OTP screen would wait forever for a code that
        // was never sent, so resolve the real landing route instead.
        if (data.session) {
          router.replace('/(auth)/resolving');
        } else {
          router.push({ pathname: '/(auth)/verify-email', params: { email: values.email } });
        }
      },
    });
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={260} color="rgba(155,126,222,0.1)" top={-60} left={-60} duration={10000} />
        <GlowOrb size={220} color="rgba(106,79,192,0.11)" bottom={-40} right={-30} duration={9000} delay={1000} />
      </ScreenBackground>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerClassName="px-6 pb-8" keyboardShouldPersistTaps="handled" style={{ paddingTop: 68 }}>
          <View className="mb-6 flex-row items-center justify-between">
            <IconButton onPress={() => router.back()}>
              <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
            </IconButton>
            <BrandLogo size={44} />
            <View style={{ width: 44 }} />
          </View>

          <Animated.View entering={FadeInDown.duration(350)}>
            <Text className="mb-1 font-display text-[32px] leading-[1.08] text-ink">
              Créer ton compte
            </Text>
            <Text className="mb-[22px] font-body text-[13px] text-ink-muted">
              Quelques infos et l'aventure commence.
            </Text>
          </Animated.View>

          {registerError ? (
            <View className="mb-4">
              <ErrorState error={registerError} variant="inline" onRetry={handleSubmit(onSubmit)} />
            </View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <GlassInput
                label="Email"
                icon={<Mail size={15} color="rgba(62,53,82,0.26)" />}
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
                icon={<Lock size={15} color="rgba(62,53,82,0.26)" />}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                rightIcon={
                  showPassword ? (
                    <EyeOff size={15} color="rgba(62,53,82,0.2)" />
                  ) : (
                    <Eye size={15} color="rgba(62,53,82,0.2)" />
                  )
                }
                onRightIconPress={() => setShowPassword((v) => !v)}
              />
            )}
          />

          <Pressable
            onPress={() => setValue('acceptedTerms', !accepted as unknown as true, { shouldValidate: true })}
            className="mb-[18px] mt-1 flex-row items-start gap-2.5"
          >
            {accepted ? (
              <LinearGradient
                colors={gradients.brand}
                style={{ width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center' }}
              >
                <Check size={11} color="#fff" strokeWidth={3} />
              </LinearGradient>
            ) : (
              <View className="h-[22px] w-[22px] rounded-[7px] border-[1.5px] border-ink/20" />
            )}
            <Text className="flex-1 font-body text-[11.5px] leading-[17px] text-ink-muted">
              J'accepte les{' '}
              <Text
                onPress={() => router.push('/legal/terms')}
                className="font-heading-semibold text-brand underline"
              >
                CGU
              </Text>{' '}
              et la{' '}
              <Text
                onPress={() => router.push('/legal/privacy')}
                className="font-heading-semibold text-brand underline"
              >
                Politique de confidentialité
              </Text>{' '}
              d'AfriLove World
            </Text>
          </Pressable>
          {errors.acceptedTerms ? (
            <Text className="mb-2 font-body text-[11px] text-danger">{errors.acceptedTerms.message}</Text>
          ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).duration(350)}>
          <GradientButton
            label="Créer mon compte"
            loading={register.isPending}
            onPress={handleSubmit(onSubmit)}
            style={{ marginBottom: 14 }}
          />

          <Text className="text-center font-body text-[13px] text-ink-muted">
            Déjà membre ?{' '}
            <Text onPress={() => router.push('/(auth)/login')} className="font-heading-semibold text-brand">
              Se connecter
            </Text>
          </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
