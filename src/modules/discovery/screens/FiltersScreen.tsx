import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/layout';
import { Chip } from '@/shared/components/ui/Chip';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { ToggleSwitch } from '@/shared/components/ui/ToggleSwitch';
import { Slider, DualSlider } from '@/shared/components/ui/RangeSlider';
import { useFiltersStore } from '@/modules/discovery/stores/filtersStore';
import { useDiscoveryCount } from '@/modules/discovery/hooks/useDiscovery';
import { useInterestsQuery } from '@/modules/profile/hooks/useReferenceData';
import { colors } from '@/shared/constants/theme';

function FilterCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="mb-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/75 px-5 py-4">{children}</View>
  );
}

/** Écran Filtres conforme à la maquette : sliders distance/âge, centres
 *  d'intérêt (catalogue BD), profils vérifiés, CTA « Voir N profils ». */
export function FiltersScreen() {
  const router = useRouter();
  const {
    distanceKm,
    ageMin,
    ageMax,
    verifiedOnly,
    interestIds,
    setDistanceKm,
    setAgeRange,
    toggleVerifiedOnly,
    toggleInterest,
    reset,
  } = useFiltersStore();
  const interestsQuery = useInterestsQuery();
  const countQuery = useDiscoveryCount();

  const interests = interestsQuery.data ?? [];
  const count = countQuery.data;

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream" />
      <ScrollView contentContainerClassName="px-6 pb-10" style={{ paddingTop: 60 }}>
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="font-display text-[26px] text-ink">Filtres</Text>
          <Pressable onPress={() => router.back()}>
            <GlassSurface variant="light" radius={15} style={{ width: 40, height: 40 }}>
              <View className="h-10 w-10 items-center justify-center">
                <ChevronLeft size={19} color={colors.ink.DEFAULT} />
              </View>
            </GlassSurface>
          </Pressable>
          <Text className="font-display text-[24px] uppercase text-ink">Filtres</Text>
          <Pressable onPress={reset} hitSlop={8}>
            <Text className="font-heading text-[11.5px] uppercase text-brand">Réinitialiser</Text>
          </Pressable>
        </View>

        <Text className="mb-3 font-heading text-[11px] text-ink/40">
          Distance maximale
        </Text>
        <View className="mb-7 flex-row flex-wrap gap-2">
          {DISTANCE_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={`${option} km`}
              selected={distanceKm === option}
              onPress={() => setDistanceKm(option)}
            />
          ))}
        </View>

        <Text className="mb-3 font-heading text-[11px] text-ink/40">Tranche d'âge</Text>
        <View className="mb-7 flex-row items-center justify-between rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45] px-5 py-4">
          <Stepper
            value={ageMin}
            onDecrement={() => setAgeRange(Math.max(18, ageMin - 1), ageMax)}
            onIncrement={() => setAgeRange(Math.min(ageMax, ageMin + 1), ageMax)}
          />
          <Text className="font-body-medium text-[12px] text-ink-muted">à</Text>
          <Stepper
            value={ageMax}
            onDecrement={() => setAgeRange(ageMin, Math.max(ageMin, ageMax - 1))}
            onIncrement={() => setAgeRange(ageMin, Math.min(99, ageMax + 1))}
          />
        </View>

        <View className="mb-8 flex-row items-center justify-between rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45] px-5 py-4">
          <Text className="font-heading-semibold text-[13px] text-ink">Profils vérifiés uniquement</Text>
          <ToggleSwitch value={verifiedOnly} onChange={toggleVerifiedOnly} />
        </View>

        <GradientButton
          label={
            countQuery.isLoading || count == null
              ? 'Voir les profils'
              : `Voir ${count} profil${count > 1 ? 's' : ''}`
          }
          onPress={() => router.back()}
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </View>
  );
}
