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
          <Pressable onPress={() => router.back()} accessibilityLabel="Retour">
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

        <FilterCard>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-heading-semibold text-[13px] uppercase text-ink">Distance</Text>
            <Text className="font-heading text-[12.5px] text-brand">{distanceKm} km</Text>
          </View>
          <Slider min={5} max={200} step={5} value={distanceKm} onChange={setDistanceKm} />
        </FilterCard>

        <FilterCard>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-heading-semibold text-[13px] uppercase text-ink">Tranche d'âge</Text>
            <Text className="font-heading text-[12.5px] text-brand">
              {ageMin} – {ageMax}
            </Text>
          </View>
          <DualSlider min={18} max={70} step={1} lowValue={ageMin} highValue={ageMax} onChange={setAgeRange} />
        </FilterCard>

        <FilterCard>
          <Text className="mb-3 font-heading-semibold text-[13px] uppercase text-ink">Centres d'intérêt</Text>
          {interestsQuery.isLoading ? (
            <ActivityIndicator color={colors.brand.DEFAULT} />
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {interests.map((interest) => (
                <Chip
                  key={interest.id}
                  label={interest.label}
                  size="sm"
                  selected={interestIds.includes(interest.id)}
                  onPress={() => toggleInterest(interest.id)}
                />
              ))}
            </View>
          )}
        </FilterCard>

        <FilterCard>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="mb-0.5 font-heading-semibold text-[13px] uppercase text-ink">Profils vérifiés</Text>
              <Text className="font-body text-[11px] text-ink-muted">Uniquement les comptes certifiés</Text>
            </View>
            <ToggleSwitch value={verifiedOnly} onChange={toggleVerifiedOnly} />
          </View>
        </FilterCard>

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
