import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { OnboardingLayout } from '@/modules/onboarding/components/OnboardingLayout';
import { OnboardingHeader } from '@/modules/onboarding/components/OnboardingHeader';
import { Chip } from '@/shared/components/ui/Chip';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { useOnboardingStore } from '@/modules/onboarding/stores/onboardingStore';
import { INTERESTS as INTEREST_OPTIONS } from '@/shared/constants/interests';
import { colors } from '@/shared/constants/theme';

const MIN_INTERESTS = 3;

export function InterestsScreen() {
  const router = useRouter();
  const interests = useOnboardingStore((s) => s.interests);
  const toggleInterest = useOnboardingStore((s) => s.toggleInterest);
  const isValid = interests.length >= MIN_INTERESTS;

  return (
    <OnboardingLayout orbPosition="topRight">
      <OnboardingHeader step={5} />

      <Text className="mb-1 font-display text-[34px] uppercase leading-none text-ink">Vos passions</Text>
      <Text className="mb-[18px] font-body text-[12.5px] text-ink-muted">
        Sélectionnez au moins {MIN_INTERESTS} centres d'intérêt.
      </Text>

      <View className="flex-1 flex-row flex-wrap content-start gap-2.5">
        {INTEREST_OPTIONS.map((interest) => (
          <Chip
            key={interest.key}
            icon={
              <interest.Icon
                size={13}
                color={interests.includes(interest.label) ? '#fff' : colors.brand.DEFAULT}
              />
            }
            label={interest.label}
            selected={interests.includes(interest.label)}
            onPress={() => toggleInterest(interest.label)}
          />
        ))}
      </View>

      <View className="my-3.5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-brand">
            <Text className="font-heading text-[12px] text-white">{interests.length}</Text>
          </View>
          <Text className="font-body-medium text-[12px] text-ink-muted">sélectionnés</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="font-body-medium text-[11px] text-ink/30">min. {MIN_INTERESTS}</Text>
          {isValid ? <Check size={11} color="rgba(26,8,4,0.3)" strokeWidth={3} /> : null}
        </View>
      </View>

      <GradientButton label="Continuer" disabled={!isValid} onPress={() => router.push('/(onboarding)/upload-photos')} />
    </OnboardingLayout>
  );
}
