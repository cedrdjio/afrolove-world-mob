import { ChoiceListEditor } from '@/shared/components/ui/ChoiceListEditor';
import { SearchFieldLayout } from '@/modules/search/components/SearchFieldLayout';
import { useSearchFiltersStore } from '@/modules/search/stores/searchFiltersStore';

const OPTIONS = ['Peu importe', 'Chrétienne', 'Musulmane', 'Traditionnelle africaine', 'Autre'];

export function ReligionFilterScreen() {
  const { religion, setReligion } = useSearchFiltersStore();

  return (
    <SearchFieldLayout title="Religion">
      <ChoiceListEditor options={OPTIONS} value={religion} onChange={setReligion} />
    </SearchFieldLayout>
  );
}
