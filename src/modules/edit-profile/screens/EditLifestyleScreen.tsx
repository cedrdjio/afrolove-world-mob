import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Chip } from '@/shared/components/ui/Chip';
import { EditScreenLayout } from '@/modules/edit-profile/components/EditScreenLayout';

const CATEGORIES = [
  { key: 'tabac', label: '🚬 Tabac', options: ['Non-fumeur', 'Occasionnel', 'Fumeur'] },
  { key: 'alcool', label: '🍷 Alcool', options: ['Jamais', 'Socialement', 'Régulièrement'] },
  { key: 'sport', label: '💪 Sport', options: ['Jamais', 'Occasionnel', 'Régulier'] },
  { key: 'enfants', label: '👶 Enfants', options: ["N'en veut pas", 'En a déjà', 'En veut'] },
  { key: 'animaux', label: '🐾 Animaux', options: ['Adore', 'Neutre', 'Pas fan'] },
] as const;

const INITIAL: Record<string, string> = {
  tabac: 'Non-fumeur',
  alcool: 'Socialement',
  sport: 'Régulier',
  enfants: 'En veut',
  animaux: 'Adore',
};

export function EditLifestyleScreen() {
  const router = useRouter();
  const [choices, setChoices] = useState<Record<string, string>>(INITIAL);

  return (
    <EditScreenLayout title="Mode de vie" onSave={() => router.back()}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {CATEGORIES.map((category) => (
          <View key={category.key} className="mb-5">
            <Text className="mb-2.5 font-heading text-[10px] uppercase tracking-widest text-ink/40">
              {category.label}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {category.options.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  selected={choices[category.key] === option}
                  onPress={() => setChoices((prev) => ({ ...prev, [category.key]: option }))}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </EditScreenLayout>
  );
}
