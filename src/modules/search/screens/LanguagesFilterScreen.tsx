import { View } from 'react-native';
import { Chip } from '@/shared/components/ui/Chip';
import { SearchFieldLayout } from '@/modules/search/components/SearchFieldLayout';
import { useSearchFiltersStore } from '@/modules/search/stores/searchFiltersStore';

const OPTIONS = ['Français', 'Anglais', 'Yoruba', 'Twi', 'Swahili', 'Arabe', 'Portugais', 'Wolof', 'Lingala'];

export function LanguagesFilterScreen() {
  const { languages, toggleLanguage } = useSearchFiltersStore();

  return (
    <SearchFieldLayout title="Langues" scrollable={false}>
      <View className="flex-row flex-wrap gap-2">
        {OPTIONS.map((lang) => (
          <Chip key={lang} label={lang} selected={languages.includes(lang)} onPress={() => toggleLanguage(lang)} />
        ))}
      </View>
    </SearchFieldLayout>
  );
}
