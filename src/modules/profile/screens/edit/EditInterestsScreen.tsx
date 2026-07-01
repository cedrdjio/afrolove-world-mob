import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Chip } from '@/shared/components/ui/Chip';
import { Skeleton } from '@/shared/components/feedback';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { useInterestsQuery } from '@/modules/profile/hooks/useReferenceData';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useUpdateInterests } from '@/modules/profile/hooks/useUpdateProfile';
import { MIN_INTERESTS } from '@/modules/profile/types/profile';
import { resolveIcon } from '@/shared/utils/resolveIcon';
import { colors } from '@/shared/constants/theme';

export function EditInterestsScreen() {
  const router = useRouter();
  const interestsQuery = useInterestsQuery();
  const profileQuery = useProfileQuery();
  const updateInterests = useUpdateInterests();
  const [selected, setSelected] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profileQuery.data && !initialized) {
      setSelected(profileQuery.data.interestIds);
      setInitialized(true);
    }
  }, [profileQuery.data, initialized]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const handleSave = () => {
    updateInterests.mutate(selected, { onSuccess: () => router.back() });
  };

  return (
    <EditScreenLayout
      title="Intérêts"
      subtitle={`Sélectionnez au moins ${MIN_INTERESTS} centres d'intérêt (${selected.length} sélectionnés).`}
      onSave={handleSave}
      saveDisabled={selected.length < MIN_INTERESTS}
      saveLabel={updateInterests.isPending ? 'Enregistrement…' : 'Enregistrer'}
    >
      <View className="flex-row flex-wrap gap-2.5">
        {interestsQuery.isPending
          ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} width={90} height={34} radius={17} />)
          : interestsQuery.data?.map((interest) => {
              const Icon = resolveIcon(interest.icon);
              const isSelected = selected.includes(interest.id);
              return (
                <Chip
                  key={interest.id}
                  icon={<Icon size={13} color={isSelected ? '#fff' : colors.brand.DEFAULT} />}
                  label={interest.label}
                  selected={isSelected}
                  onPress={() => toggle(interest.id)}
                />
              );
            })}
      </View>
    </EditScreenLayout>
  );
}
