import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Image } from 'expo-image';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { images } from '@/shared/constants/images';
import { colors } from '@/shared/constants/theme';
import { loginSchema, type LoginFormValues } from '@/modules/auth/types/schemas';

export function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = () => router.replace('/(tabs)/discover');

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={280} color="rgba(200,96,64,0.12)" top={-70} right={-70} duration={9000} />
        <GlowOrb size={220} color="rgba(201,134,42,0.09)" bottom={-40} left={-40} duration={11000} delay={1500} />
      </ScreenBackground>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerClassName="px-6 pb-8" keyboardShouldPersistTaps="handled" style={{ paddingTop: 68 }}>
          <View className="mb-8 flex-row items-center justify-between">
            <IconButton onPress={() => router.back()}>
              <Text style={{ fontSize: 19, color: colors.ink.DEFAULT }}>←</Text>
            </IconButton>
            <Image source={images.logoLight} style={{ width: 44, height: 44, borderRadius: 13 }} contentFit="cover" />
            <View style={{ width: 44 }} />
          </View>

          <Text className="mb-1.5 font-display text-[38px] uppercase leading-none text-ink">Bon retour 👋</Text>
          <Text className="mb-7 font-body text-[13px] text-ink-muted">Ravis de vous revoir parmi nous.</Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <GlassInput
                label="Email"
                icon={<Mail size={16} color="rgba(44,20,8,0.28)" />}
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
                icon={<Lock size={16} color="rgba(44,20,8,0.28)" />}
                placeholder="••••••••••"
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                rightIcon={
                  showPassword ? (
                    <EyeOff size={15} color="rgba(44,20,8,0.22)" />
                  ) : (
                    <Eye size={15} color="rgba(44,20,8,0.22)" />
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

          <GradientButton label="Se connecter" onPress={handleSubmit(onSubmit)} style={{ marginBottom: 18 }} />

          <View className="mb-4 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-ink/[0.08]" />
            <Text className="font-body-medium text-[11px] text-ink/[0.28]">ou continuer avec</Text>
            <View className="h-px flex-1 bg-ink/[0.08]" />
          </View>

          <View className="mb-6 flex-row gap-2.5">
            <View className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-[1.5px] border-white/90 bg-white/75 py-3.5">
              <Text className="text-[15px] font-bold" style={{ color: '#4285F4' }}>
                G
              </Text>
              <Text className="font-heading-semibold text-[13px] text-ink">Google</Text>
            </View>
            <View className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-[#1C1C1E] py-3.5">
              <Text style={{ fontSize: 16 }}>🍎</Text>
              <Text className="font-heading-semibold text-[13px] text-white">Apple</Text>
            </View>
          </View>

          <Text className="text-center font-body text-[13px] text-ink-muted">
            Pas encore membre ?{' '}
            <Text onPress={() => router.push('/(auth)/register')} className="font-heading-semibold text-brand">
              Créer un compte
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
