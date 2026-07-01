import { ChoiceListEditor } from '@/shared/components/ui/ChoiceListEditor';
import { SearchFieldLayout } from '@/modules/search/components/SearchFieldLayout';
import { useSearchFiltersStore } from '@/modules/search/stores/searchFiltersStore';

const OPTIONS = ['Tous les pays', 'Nigeria', 'Ghana', 'Sénégal', "Côte d'Ivoire", 'Kenya', 'France', 'Royaume-Uni', 'États-Unis'];

export function CountryFilterScreen() {
  const { country, setCountry } = useSearchFiltersStore();

  return (
    <SearchFieldLayout title="Pays">
      <ChoiceListEditor options={OPTIONS} value={country} onChange={setCountry} />
    </SearchFieldLayout>
  );
}
