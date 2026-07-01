import { ChoiceListEditor } from '@/shared/components/ui/ChoiceListEditor';
import { SearchFieldLayout } from '@/modules/search/components/SearchFieldLayout';
import { useSearchFiltersStore } from '@/modules/search/stores/searchFiltersStore';

const OPTIONS = ['Peu importe', 'Lycée', 'Licence', 'Master', 'Doctorat', 'Formation professionnelle'];

export function EducationFilterScreen() {
  const { education, setEducation } = useSearchFiltersStore();

  return (
    <SearchFieldLayout title="Éducation">
      <ChoiceListEditor options={OPTIONS} value={education} onChange={setEducation} />
    </SearchFieldLayout>
  );
}
