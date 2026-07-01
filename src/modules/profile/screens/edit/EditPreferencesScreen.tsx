import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Chip } from '@/shared/components/ui/Chip';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { colors } from '@/shared/constants/theme';
import { Minus, Plus } from 'lucide-react-native';
import { Pressable } from 'react-native';

const LOOKING_FOR_OPTIONS = ['Des femmes', 'Des hommes', 'Les deux'];
const DISTANCE_OPTIONS = [5, 10, 25, 50, 100];

function Stepper({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <View className="flex-row items-center gap-3.5">
      <Pressable onPress={() => onChange(Math.max(min, value - 1))}>
        <GlassSurface variant="light" radius={14} style={{ width: 36, height: 36 }}>
          <View className="h-9 w-9 items-center justify-center">
            <Minus size={14} color={colors.ink.DEFAULT} />
          </View>
        </GlassSurface>
      </Pressable>
      <Text className="w-8 text-center font-display text-[20px] text-ink">{value}</Text>
      <Pressable onPress={() => onChange(Math.min(max, value + 1))}>
        <GlassSurface variant="light" radius={14} style={{ width: 36, height: 36 }}>
          <View className="h-9 w-9 items-center justify-center">
            <Plus size={14} color={colors.ink.DEFAULT} />
          </View>
        </GlassSurface>
      </Pressable>
    </View>
  );
}

export function EditPreferencesScreen() {
  const router = useRouter();
  const [lookingFor, setLookingFor] = useState('Des hommes');
  const [distance, setDistance] = useState(25);
  const [ageMin, setAgeMin] = useState(24);
  const [ageMax, setAgeMax] = useState(35);

  return (
    <EditScreenLayout title="Préférences" onSave={() => router.back()}>
      <Text className="mb-2.5 font-heading text-[11px] uppercase tracking-widest text-ink/40">Je recherche</Text>
      <View className="mb-6 flex-row flex-wrap gap-2">
        {LOOKING_FOR_OPTIONS.map((option) => (
          <Chip key={option} label={option} selected={lookingFor === option} onPress={() => setLookingFor(option)} />
        ))}
      </View>

      <Text className="mb-2.5 font-heading text-[11px] uppercase tracking-widest text-ink/40">Distance maximale</Text>
      <View className="mb-6 flex-row flex-wrap gap-2">
        {DISTANCE_OPTIONS.map((option) => (
          <Chip key={option} label={`${option} km`} selected={distance === option} onPress={() => setDistance(option)} />
        ))}
      </View>

      <Text className="mb-2.5 font-heading text-[11px] uppercase tracking-widest text-ink/40">Tranche d'âge</Text>
      <View className="flex-row items-center justify-between rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-5 py-4">
        <Stepper value={ageMin} onChange={(v) => setAgeMin(Math.min(v, ageMax))} min={18} max={ageMax} />
        <Text className="font-body-medium text-[12px] text-ink-muted">à</Text>
        <Stepper value={ageMax} onChange={(v) => setAgeMax(Math.max(v, ageMin))} min={ageMin} max={99} />
      </View>
    </EditScreenLayout>
  );
}
