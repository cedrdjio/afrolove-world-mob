import { ChoiceListEditor } from '@/shared/components/ui/ChoiceListEditor';
import { SearchFieldLayout } from '@/modules/search/components/SearchFieldLayout';
import { useSearchFiltersStore } from '@/modules/search/stores/searchFiltersStore';

const OPTIONS = ['Toutes les villes', 'Lagos', 'Accra', 'Dakar', 'Abidjan', 'Nairobi', 'Paris', 'Londres'];

export function CityFilterScreen() {
  const { city, setCity } = useSearchFiltersStore();

  return (
    <SearchFieldLayout title="Ville">
      <ChoiceListEditor options={OPTIONS} value={city} onChange={setCity} />
    </SearchFieldLayout>
  );
}
