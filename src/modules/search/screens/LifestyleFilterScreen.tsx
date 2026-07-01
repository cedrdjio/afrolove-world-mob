import { View } from 'react-native';
import { Chip } from '@/shared/components/ui/Chip';
import { SearchFieldLayout } from '@/modules/search/components/SearchFieldLayout';
import { useSearchFiltersStore } from '@/modules/search/stores/searchFiltersStore';

const OPTIONS = [
  'Non-fumeur', 'Boit socialement', 'Sportif', 'Aime les animaux',
  'Veut des enfants', 'Pratiquant', 'Aime voyager', 'Cuisine',
];

export function LifestyleFilterScreen() {
  const { lifestyle, toggleLifestyle } = useSearchFiltersStore();

  return (
    <SearchFieldLayout title="Mode de vie" scrollable={false}>
      <View className="flex-row flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={lifestyle.includes(option)}
            onPress={() => toggleLifestyle(option)}
          />
        ))}
      </View>
    </SearchFieldLayout>
  );
}
