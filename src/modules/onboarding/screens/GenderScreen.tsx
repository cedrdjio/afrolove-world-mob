import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/modules/onboarding/components/OnboardingLayout';
import { OnboardingHeader } from '@/modules/onboarding/components/OnboardingHeader';
import { OptionCard } from '@/modules/onboarding/components/OptionCard';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { useOnboardingStore, type Gender } from '@/modules/onboarding/stores/onboardingStore';

const OPTIONS: { value: Gender; emoji: string; title: string; description: string }[] = [
  { value: 'femme', emoji: '👩🏿', title: 'Femme', description: "Je m'identifie comme une femme" },
  { value: 'homme', emoji: '👨🏿', title: 'Homme', description: "Je m'identifie comme un homme" },
  { value: 'non-binaire', emoji: '🌈', title: 'Non-binaire', description: "Je m'identifie autrement" },
];

export function GenderScreen() {
  const router = useRouter();
  const gender = useOnboardingStore((s) => s.gender);
  const setGender = useOnboardingStore((s) => s.setGender);

  return (
    <OnboardingLayout orbPosition="bottomLeft">
      <OnboardingHeader step={2} />

      <View className="mb-5 h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-white/70">
        <Text style={{ fontSize: 28 }}>✨</Text>
      </View>
      <Text className="mb-2 font-display text-[38px] uppercase leading-none text-ink">Je suis…</Text>
      <Text className="mb-6 font-body text-[13px] leading-5 text-ink-muted">Personnalisez votre expérience.</Text>

      <View className="flex-1 gap-3">
        {OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            emoji={option.emoji}
            title={option.title}
            description={option.description}
            selected={gender === option.value}
            onPress={() => setGender(option.value)}
          />
        ))}
      </View>

      <GradientButton
        label="Continuer"
        disabled={!gender}
        onPress={() => router.push('/(onboarding)/birthday')}
      />
    </OnboardingLayout>
  );
}
