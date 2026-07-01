import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { PartyPopper } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withDelay } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { gradients } from '@/shared/constants/theme';
import { useOnboardingStore } from '@/modules/onboarding/stores/onboardingStore';
import { useCompleteOnboarding } from '@/modules/onboarding/hooks/useCompleteOnboarding';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { mapToAppError } from '@/shared/utils/errorMapping';

export function FinishScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const onboarding = useOnboardingStore();
  const completeOnboarding = useCompleteOnboarding();
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(150, withSpring(1, { damping: 9, stiffness: 120 }));
  }, [scale]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleFinish = () => {
    if (!user || !onboarding.gender || !onboarding.lookingFor) return;
    completeOnboarding.mutate(
      {
        userId: user.id,
        firstName: onboarding.firstName,
        lastName: onboarding.lastName,
        gender: onboarding.gender,
        birthDate: onboarding.birthDate,
        lookingFor: onboarding.lookingFor,
        bio: onboarding.bio,
        interestIds: onboarding.interestIds,
        lifestyle: onboarding.lifestyle,
        photoUris: onboarding.photos,
      },
      { onSuccess: () => router.replace('/(auth)/resolving') },
    );
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={280} color="rgba(201,134,42,0.2)" top={110} right={-50} duration={9000} />
        <GlowOrb size={220} color="rgba(200,96,64,0.18)" bottom={160} left={-30} duration={11000} delay={1000} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-8">
        <Animated.View style={iconStyle} className="mb-7">
          <LinearGradient
            colors={gradients.brand}
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#C86040',
              shadowOpacity: 0.45,
              shadowRadius: 30,
              shadowOffset: { width: 0, height: 14 },
            }}
          >
            <PartyPopper size={42} color="#fff" strokeWidth={1.8} />
          </LinearGradient>
        </Animated.View>

        <Text className="mb-3 text-center font-display-black text-[32px] uppercase text-white">
          Profil complet{onboarding.firstName ? `, ${onboarding.firstName}` : ''} !
        </Text>
        <Text className="mb-8 text-center font-body text-[13.5px] leading-[21px] text-white/50">
          Votre profil AfroLove World est prêt.{'\n'}Il est temps de faire de belles rencontres.
        </Text>

        {completeOnboarding.isError ? (
          <View className="mb-6 w-full">
            <ErrorState
              error={mapToAppError(completeOnboarding.error)}
              variant="inline"
              tone="onDark"
              onRetry={handleFinish}
            />
          </View>
        ) : null}

        <GradientButton
          label="Découvrir l'application"
          loading={completeOnboarding.isPending}
          onPress={handleFinish}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}
