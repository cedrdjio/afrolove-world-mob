import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Chip } from '@/shared/components/ui/Chip';
import { EditScreenLayout } from '@/modules/edit-profile/components/EditScreenLayout';

const ALL_INTERESTS = [
  '🎵 Musique', '💃 Danse', '✈️ Voyage', '🍲 Cuisine', '🎨 Art', '📚 Lecture',
  '🧘 Yoga', '👗 Mode', '⚽ Sport', '👨‍👩‍👧 Famille', '🙏 Spiritualité', '🌍 Culture', '🎬 Cinéma',
];
const INITIAL_SELECTED = ['🎵 Musique', '✈️ Voyage', '📚 Lecture', '👨‍👩‍👧 Famille'];

export function EditInterestsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(INITIAL_SELECTED);

  const toggle = (value: string) => {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  return (
    <EditScreenLayout
      title="Intérêts"
      subtitle={`Sélectionnez au moins 3 centres d'intérêt (${selected.length} sélectionnés).`}
      onSave={() => router.back()}
      saveDisabled={selected.length < 3}
    >
      <View className="flex-row flex-wrap gap-2.5">
        {ALL_INTERESTS.map((interest) => (
          <Chip key={interest} label={interest} selected={selected.includes(interest)} onPress={() => toggle(interest)} />
        ))}
      </View>
    </EditScreenLayout>
  );
}
