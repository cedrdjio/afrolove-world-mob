import { RangeStepper } from '@/modules/search/components/RangeStepper';
import { SearchFieldLayout } from '@/modules/search/components/SearchFieldLayout';
import { useSearchFiltersStore } from '@/modules/search/stores/searchFiltersStore';

export function AgeFilterScreen() {
  const { ageMin, ageMax, setAgeRange } = useSearchFiltersStore();

  return (
    <SearchFieldLayout title="Tranche d'âge" scrollable={false}>
      <RangeStepper min={18} max={99} low={ageMin} high={ageMax} onChange={setAgeRange} unit="à" />
    </SearchFieldLayout>
  );
}
