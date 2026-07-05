import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Minus, Plus } from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/layout';
import { Chip } from '@/shared/components/ui/Chip';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { ToggleSwitch } from '@/shared/components/ui/ToggleSwitch';
import { useFiltersStore } from '@/modules/discovery/stores/filtersStore';
import { colors } from '@/shared/constants/theme';

const DISTANCE_OPTIONS = [5, 10, 25, 50, 100];

function Stepper({ value, onDecrement, onIncrement }: { value: number; onDecrement: () => void; onIncrement: () => void }) {
  return (
    <View className="flex-row items-center gap-4">
      <Pressable onPress={onDecrement}>
        <GlassSurface variant="light" radius={16} style={{ width: 40, height: 40 }}>
          <View className="h-10 w-10 items-center justify-center">
            <Minus size={16} color={colors.ink.DEFAULT} />
          </View>
        </GlassSurface>
      </Pressable>
      <Text className="w-10 text-center font-display text-[22px] text-ink">{value}</Text>
      <Pressable onPress={onIncrement}>
        <GlassSurface variant="light" radius={16} style={{ width: 40, height: 40 }}>
          <View className="h-10 w-10 items-center justify-center">
            <Plus size={16} color={colors.ink.DEFAULT} />
          </View>
        </GlassSurface>
      </Pressable>
    </View>
  );
}

export function FiltersScreen() {
  const router = useRouter();
  const { distanceKm, ageMin, ageMax, verifiedOnly, setDistanceKm, setAgeRange, toggleVerifiedOnly } =
    useFiltersStore();

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream" />
      <ScrollView contentContainerClassName="px-6 pb-8" style={{ paddingTop: 24 }}>
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="font-display text-[26px] text-ink">Filtres</Text>
          <Pressable onPress={() => router.back()}>
            <GlassSurface variant="light" radius={15} style={{ width: 40, height: 40 }}>
              <View className="h-10 w-10 items-center justify-center">
                <X size={17} color={colors.ink.DEFAULT} />
              </View>
            </GlassSurface>
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

        <GradientButton label="Appliquer les filtres" onPress={() => router.back()} />
      </ScrollView>
    </View>
  );
}
