import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Chip } from '@/shared/components/ui/Chip';
import { EditScreenLayout } from '@/modules/edit-profile/components/EditScreenLayout';

const ALL_LANGUAGES = ['Français', 'Anglais', 'Yoruba', 'Twi', 'Swahili', 'Arabe', 'Portugais', 'Wolof', 'Lingala'];
const INITIAL_SELECTED = ['Français', 'Anglais', 'Yoruba'];

export function EditLanguagesScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(INITIAL_SELECTED);

  const toggle = (value: string) => {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  return (
    <EditScreenLayout
      title="Langues"
      subtitle="Quelles langues parlez-vous ?"
      onSave={() => router.back()}
      saveDisabled={selected.length === 0}
    >
      <View className="flex-row flex-wrap gap-2.5">
        {ALL_LANGUAGES.map((lang) => (
          <Chip key={lang} label={lang} selected={selected.includes(lang)} onPress={() => toggle(lang)} />
        ))}
      </View>
    </EditScreenLayout>
  );
}
