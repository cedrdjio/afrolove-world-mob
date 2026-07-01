import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Chip } from '@/shared/components/ui/Chip';
import { EditScreenLayout } from '@/modules/edit-profile/components/EditScreenLayout';
import { LIFESTYLE_CATEGORIES } from '@/shared/constants/lifestyle';
import { colors } from '@/shared/constants/theme';

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
        {LIFESTYLE_CATEGORIES.map((category) => (
          <View key={category.key} className="mb-5">
            <View className="mb-2.5 flex-row items-center gap-1.5">
              <category.Icon size={12} color={colors.ink.muted} />
              <Text className="font-heading text-[10px] uppercase tracking-widest text-ink/40">
                {category.label}
              </Text>
            </View>
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
