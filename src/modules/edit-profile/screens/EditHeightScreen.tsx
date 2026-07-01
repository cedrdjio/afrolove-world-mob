import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Minus, Plus } from 'lucide-react-native';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { EditScreenLayout } from '@/modules/edit-profile/components/EditScreenLayout';
import { colors } from '@/shared/constants/theme';

export function EditHeightScreen() {
  const router = useRouter();
  const [height, setHeight] = useState(168);

  return (
    <EditScreenLayout title="Taille" subtitle="Ajustez votre taille en centimètres." onSave={() => router.back()} scrollable={false}>
      <View className="flex-1 items-center justify-center">
        <View className="flex-row items-center gap-8">
          <Pressable onPress={() => setHeight((h) => Math.max(140, h - 1))}>
            <GlassSurface variant="light" radius={22} style={{ width: 52, height: 52 }}>
              <View className="h-[52px] w-[52px] items-center justify-center">
                <Minus size={20} color={colors.ink.DEFAULT} />
              </View>
            </GlassSurface>
          </Pressable>
          <View className="items-center">
            <Text className="font-display text-[56px] leading-[56px] text-ink">{height}</Text>
            <Text className="font-heading text-[11px] uppercase tracking-widest text-ink-faint">centimètres</Text>
          </View>
          <Pressable onPress={() => setHeight((h) => Math.min(220, h + 1))}>
            <GlassSurface variant="light" radius={22} style={{ width: 52, height: 52 }}>
              <View className="h-[52px] w-[52px] items-center justify-center">
                <Plus size={20} color={colors.ink.DEFAULT} />
              </View>
            </GlassSurface>
          </Pressable>
        </View>
      </View>
    </EditScreenLayout>
  );
}
