import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Minus, Plus } from 'lucide-react-native';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { Skeleton, ErrorState } from '@/shared/components/feedback';
import { colors } from '@/shared/constants/theme';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useUpdateProfile } from '@/modules/profile/hooks/useUpdateProfile';
import { useAppError } from '@/shared/hooks/useAppError';

export function EditHeightScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const updateProfile = useUpdateProfile();
  const updateProfileError = useAppError(updateProfile.error);
  const [height, setHeight] = useState(168);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profileQuery.data && !initialized) {
      setHeight(profileQuery.data.heightCm ?? 168);
      setInitialized(true);
    }
  }, [profileQuery.data, initialized]);

  const handleSave = () => {
    updateProfile.mutate({ height_cm: height }, { onSuccess: () => router.back() });
  };

  return (
    <EditScreenLayout
      title="Taille"
      subtitle="Ajustez votre taille en centimètres."
      onSave={handleSave}
      saveLabel={updateProfile.isPending ? 'Enregistrement…' : 'Enregistrer'}
      scrollable={false}
    >
      {updateProfileError ? (
        <View className="mb-4">
          <ErrorState error={updateProfileError} variant="inline" onRetry={handleSave} />
        </View>
      ) : null}

      <View className="flex-1 items-center justify-center">
        {profileQuery.isPending ? (
          <Skeleton width={220} height={52} radius={26} />
        ) : (
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
        )}
      </View>
    </EditScreenLayout>
  );
}
