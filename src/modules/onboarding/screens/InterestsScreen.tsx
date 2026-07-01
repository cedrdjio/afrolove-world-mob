import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/modules/onboarding/components/OnboardingLayout';
import { OnboardingHeader } from '@/modules/onboarding/components/OnboardingHeader';
import { Chip } from '@/shared/components/ui/Chip';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { useOnboardingStore } from '@/modules/onboarding/stores/onboardingStore';

const INTERESTS = [
  '🎵 Musique',
  '💃 Danse',
  '✈️ Voyage',
  '🍲 Cuisine',
  '🎨 Art',
  '📚 Lecture',
  '🧘 Yoga',
  '👗 Mode',
  '⚽ Sport',
  '👨‍👩‍👧 Famille',
  '🙏 Spiritualité',
  '🌍 Culture',
  '🎬 Cinéma',
];

const MIN_INTERESTS = 3;

export function InterestsScreen() {
  const router = useRouter();
  const interests = useOnboardingStore((s) => s.interests);
  const toggleInterest = useOnboardingStore((s) => s.toggleInterest);
  const isValid = interests.length >= MIN_INTERESTS;

  return (
    <OnboardingLayout orbPosition="topRight">
      <OnboardingHeader step={5} />

      <Text className="mb-1 font-display text-[34px] uppercase leading-none text-ink">Vos passions 🌟</Text>
      <Text className="mb-[18px] font-body text-[12.5px] text-ink-muted">
        Sélectionnez au moins {MIN_INTERESTS} centres d'intérêt.
      </Text>

      <View className="flex-1 flex-row flex-wrap content-start gap-2.5">
        {INTERESTS.map((interest) => (
          <Chip
            key={interest}
            label={interest}
            selected={interests.includes(interest)}
            onPress={() => toggleInterest(interest)}
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
        <Text className="font-body-medium text-[11px] text-ink/30">min. {MIN_INTERESTS} {isValid ? '✓' : ''}</Text>
      </View>

      <GradientButton label="Continuer" disabled={!isValid} onPress={() => router.push('/(onboarding)/upload-photos')} />
    </OnboardingLayout>
  );
}
