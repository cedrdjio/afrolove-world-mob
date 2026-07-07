import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { OnboardingLayout } from '@/modules/onboarding/components/OnboardingLayout';
import { OnboardingHeader } from '@/modules/onboarding/components/OnboardingHeader';
import { Chip } from '@/shared/components/ui/Chip';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { Skeleton } from '@/shared/components/feedback';
import { useOnboardingStore } from '@/modules/onboarding/stores/onboardingStore';
import { useInterestsQuery } from '@/modules/profile/hooks/useReferenceData';
import { MIN_INTERESTS } from '@/modules/profile/types/profile';
import { resolveIcon } from '@/shared/utils/resolveIcon';
import { colors } from '@/shared/constants/theme';

export function InterestsScreen() {
  const router = useRouter();
  const interestIds = useOnboardingStore((s) => s.interestIds);
  const toggleInterest = useOnboardingStore((s) => s.toggleInterest);
  const interestsQuery = useInterestsQuery();
  const isValid = interestIds.length >= MIN_INTERESTS;

  return (
    <OnboardingLayout orbPosition="topRight">
      <OnboardingHeader step={5} total={8} />

      <Text className="mb-1 font-display text-[34px] leading-none text-ink">Vos passions</Text>
      <Text className="mb-[18px] font-body text-[12.5px] text-ink-muted">
        Sélectionnez au moins {MIN_INTERESTS} centres d'intérêt.
      </Text>

      <View className="flex-1 flex-row flex-wrap content-start gap-2.5">
        {interestsQuery.isPending
          ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} width={90} height={34} radius={17} />)
          : interestsQuery.data?.map((interest) => {
              const Icon = resolveIcon(interest.icon);
              const selected = interestIds.includes(interest.id);
              return (
                <Chip
                  key={interest.id}
                  icon={<Icon size={13} color={selected ? '#fff' : colors.brand.DEFAULT} />}
                  label={interest.label}
                  selected={selected}
                  onPress={() => toggleInterest(interest.id)}
                />
              );
            })}
      </View>

      <View className="my-3.5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-brand">
            <Text className="font-heading text-[12px] text-white">{interestIds.length}</Text>
          </View>
          <Text className="font-body-medium text-[12px] text-ink-muted">sélectionnés</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="font-body-medium text-[11px] text-ink/30">min. {MIN_INTERESTS}</Text>
          {isValid ? <Check size={11} color="rgba(46,36,64,0.3)" strokeWidth={3} /> : null}
        </View>
      </View>

      <GradientButton label="Continuer" disabled={!isValid} onPress={() => router.push('/(onboarding)/bio')} />
    </OnboardingLayout>
  );
}
