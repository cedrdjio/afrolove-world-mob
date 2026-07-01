import { View } from 'react-native';
import { Chip } from '@/shared/components/ui/Chip';
import { SearchFieldLayout } from '@/modules/search/components/SearchFieldLayout';
import { useSearchFiltersStore } from '@/modules/search/stores/searchFiltersStore';

const OPTIONS = [5, 10, 25, 50, 100, 200];

export function DistanceFilterScreen() {
  const { distanceKm, setDistanceKm } = useSearchFiltersStore();

  return (
    <SearchFieldLayout title="Distance" scrollable={false}>
      <View className="flex-row flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <Chip key={option} label={`${option} km`} selected={distanceKm === option} onPress={() => setDistanceKm(option)} />
        ))}
      </View>
    </SearchFieldLayout>
  );
}
