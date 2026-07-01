import { RangeStepper } from '@/modules/search/components/RangeStepper';
import { SearchFieldLayout } from '@/modules/search/components/SearchFieldLayout';
import { useSearchFiltersStore } from '@/modules/search/stores/searchFiltersStore';

export function HeightFilterScreen() {
  const { heightMin, heightMax, setHeightRange } = useSearchFiltersStore();

  return (
    <SearchFieldLayout title="Taille" scrollable={false}>
      <RangeStepper min={140} max={220} low={heightMin} high={heightMax} onChange={setHeightRange} unit="cm à" />
    </SearchFieldLayout>
  );
}
