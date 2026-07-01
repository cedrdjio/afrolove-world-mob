import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/modules/onboarding/components/OnboardingLayout';
import { OnboardingHeader } from '@/modules/onboarding/components/OnboardingHeader';
import { Chip } from '@/shared/components/ui/Chip';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { useOnboardingStore } from '@/modules/onboarding/stores/onboardingStore';

const CATEGORIES = [
  { key: 'tabac', label: '🚬 Tabac', options: ['Non-fumeur', 'Occasionnel', 'Fumeur'] },
  { key: 'alcool', label: '🍷 Alcool', options: ['Jamais', 'Socialement', 'Régulièrement'] },
  { key: 'sport', label: '💪 Sport', options: ['Jamais', 'Occasionnel', 'Régulier'] },
  { key: 'enfants', label: '👶 Enfants', options: ["N'en veux pas", 'En a déjà', 'En veut'] },
  { key: 'animaux', label: '🐾 Animaux', options: ['Adore', 'Neutre', 'Pas fan'] },
] as const;

export function LifestyleScreen() {
  const router = useRouter();
  const lifestyle = useOnboardingStore((s) => s.lifestyle);
  const setLifestyleChoice = useOnboardingStore((s) => s.setLifestyleChoice);
  const isValid = CATEGORIES.every((c) => Boolean(lifestyle[c.key]));

  return (
    <OnboardingLayout orbPosition="bottomRight">
      <OnboardingHeader step={7} />

      <Text className="mb-1 font-display text-[34px] uppercase leading-none text-ink">Votre mode de vie</Text>
      <Text className="mb-[18px] font-body text-[12.5px] text-ink-muted">Aidez-nous à mieux vous faire matcher.</Text>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {CATEGORIES.map((category) => (
          <View key={category.key} className="mb-5">
            <Text className="mb-2.5 font-heading text-[10px] uppercase tracking-widest text-ink/40">
              {category.label}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {category.options.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  selected={lifestyle[category.key] === option}
                  onPress={() => setLifestyleChoice(category.key, option)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <GradientButton
        label="Continuer"
        disabled={!isValid}
        onPress={() => router.push('/(onboarding)/location-permission')}
        style={{ marginTop: 8 }}
      />
    </OnboardingLayout>
  );
}
