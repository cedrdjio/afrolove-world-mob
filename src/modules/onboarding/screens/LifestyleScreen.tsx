import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/modules/onboarding/components/OnboardingLayout';
import { OnboardingHeader } from '@/modules/onboarding/components/OnboardingHeader';
import { Chip } from '@/shared/components/ui/Chip';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { useOnboardingStore } from '@/modules/onboarding/stores/onboardingStore';
import { isLifestyleComplete, type LifestyleValues } from '@/shared/constants/lifestyle';
import { useLifestyleCategories } from '@/modules/profile/hooks/useReferenceData';
import { colors } from '@/shared/constants/theme';

export function LifestyleScreen() {
  const router = useRouter();
  const lifestyle = useOnboardingStore((s) => s.lifestyle);
  const setLifestyleChoice = useOnboardingStore((s) => s.setLifestyleChoice);
  // Options chargées depuis la table lifestyle_options (gérée côté dashboard).
  const { categories, isLoading } = useLifestyleCategories();
  const isValid = isLifestyleComplete(lifestyle);

  if (isLoading) {
    return (
      <OnboardingLayout orbPosition="bottomRight">
        <OnboardingHeader step={8} total={8} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
        </View>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout orbPosition="bottomRight">
      <OnboardingHeader step={8} total={8} />

      <Text className="mb-1 font-display text-[34px] uppercase leading-none text-ink">Votre mode de vie</Text>
      <Text className="mb-[18px] font-body text-[12.5px] text-ink-muted">Aidez-nous à mieux vous faire matcher.</Text>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <View key={category.key} className="mb-5">
            <View className="mb-2.5 flex-row items-center gap-1.5">
              <category.Icon size={12} color={colors.ink.muted} />
              <Text className="font-heading text-[10px] uppercase tracking-widest text-ink/40">
                {category.label}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {category.options.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={lifestyle[category.key] === option.value}
                  onPress={() =>
                    setLifestyleChoice(category.key, option.value as LifestyleValues[keyof LifestyleValues])
                  }
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
