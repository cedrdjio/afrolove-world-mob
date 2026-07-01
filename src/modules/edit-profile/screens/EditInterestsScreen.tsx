import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Chip } from '@/shared/components/ui/Chip';
import { EditScreenLayout } from '@/modules/edit-profile/components/EditScreenLayout';
import { INTERESTS as INTEREST_OPTIONS } from '@/shared/constants/interests';
import { colors } from '@/shared/constants/theme';

const INITIAL_SELECTED = ['Musique', 'Voyage', 'Lecture', 'Famille'];

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
        {INTEREST_OPTIONS.map((interest) => (
          <Chip
            key={interest.key}
            icon={<interest.Icon size={13} color={selected.includes(interest.label) ? '#fff' : colors.brand.DEFAULT} />}
            label={interest.label}
            selected={selected.includes(interest.label)}
            onPress={() => toggle(interest.label)}
          />
        ))}
      </View>
    </EditScreenLayout>
  );
}
