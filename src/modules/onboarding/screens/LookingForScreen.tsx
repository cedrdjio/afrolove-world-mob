import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/modules/onboarding/components/OnboardingLayout';
import { OnboardingHeader } from '@/modules/onboarding/components/OnboardingHeader';
import { OptionCard } from '@/modules/onboarding/components/OptionCard';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { useOnboardingStore, type LookingForOption } from '@/modules/onboarding/stores/onboardingStore';

const OPTIONS: { value: LookingForOption; emoji: string; title: string; description: string }[] = [
  { value: 'femmes', emoji: '👩🏾', title: 'Des femmes', description: 'Afficher des profils féminins' },
  { value: 'hommes', emoji: '👨🏾', title: 'Des hommes', description: 'Afficher des profils masculins' },
  { value: 'les-deux', emoji: '💫', title: 'Les deux', description: 'Afficher tous les profils' },
];

export function LookingForScreen() {
  const router = useRouter();
  const lookingFor = useOnboardingStore((s) => s.lookingFor);
  const setLookingFor = useOnboardingStore((s) => s.setLookingFor);

  return (
    <OnboardingLayout orbPosition="bottomRight">
      <OnboardingHeader step={4} />

      <View className="mb-5 h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-white/70">
        <Text style={{ fontSize: 28 }}>🔍</Text>
      </View>
      <Text className="mb-2 font-display text-[36px] uppercase leading-none text-ink">Je recherche…</Text>
      <Text className="mb-6 font-body text-[13px] leading-5 text-ink-muted">
        Qui souhaitez-vous rencontrer sur AfroLove World ?
      </Text>

      <View className="flex-1 gap-3">
        {OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            emoji={option.emoji}
            title={option.title}
            description={option.description}
            selected={lookingFor === option.value}
            onPress={() => setLookingFor(option.value)}
          />
        ))}
      </View>

      <GradientButton
        label="Continuer"
        disabled={!lookingFor}
        onPress={() => router.push('/(onboarding)/interests')}
      />
    </OnboardingLayout>
  );
}
