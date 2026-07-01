import { Briefcase } from 'lucide-react-native';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { SearchFieldLayout } from '@/modules/search/components/SearchFieldLayout';
import { useSearchFiltersStore } from '@/modules/search/stores/searchFiltersStore';

export function ProfessionFilterScreen() {
  const { profession, setProfession } = useSearchFiltersStore();

  return (
    <SearchFieldLayout title="Profession" scrollable={false}>
      <GlassInput
        label="Métier recherché"
        icon={<Briefcase size={15} color="rgba(44,20,8,0.26)" />}
        placeholder="Ex : Ingénieur, Médecin…"
        value={profession}
        onChangeText={setProfession}
      />
    </SearchFieldLayout>
  );
}
