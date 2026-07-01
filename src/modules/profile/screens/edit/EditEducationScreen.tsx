import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChoiceListEditor } from '@/shared/components/ui/ChoiceListEditor';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { Skeleton, ErrorState } from '@/shared/components/feedback';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useEducationLevelsQuery } from '@/modules/profile/hooks/useReferenceData';
import { useUpdateProfile } from '@/modules/profile/hooks/useUpdateProfile';
import { mapToAppError } from '@/shared/utils/errorMapping';

export function EditEducationScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const educationLevelsQuery = useEducationLevelsQuery();
  const updateProfile = useUpdateProfile();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profileQuery.data && !initialized) {
      setSelectedId(profileQuery.data.educationLevelId);
      setInitialized(true);
    }
  }, [profileQuery.data, initialized]);

  const options = educationLevelsQuery.data ?? [];
  const value = options.find((e) => e.id === selectedId)?.label ?? '';

  const handleChange = (label: string) => {
    const match = options.find((e) => e.label === label);
    setSelectedId(match?.id ?? null);
  };

  const handleSave = () => {
    updateProfile.mutate({ education_level_id: selectedId }, { onSuccess: () => router.back() });
  };

  return (
    <EditScreenLayout
      title="Éducation"
      onSave={handleSave}
      saveLabel={updateProfile.isPending ? 'Enregistrement…' : 'Enregistrer'}
    >
      {updateProfile.isError ? (
        <View className="mb-4">
          <ErrorState error={mapToAppError(updateProfile.error)} variant="inline" onRetry={handleSave} />
        </View>
      ) : null}

      {profileQuery.isPending || educationLevelsQuery.isPending ? (
        <View className="gap-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={54} radius={16} />
          ))}
        </View>
      ) : (
        <ChoiceListEditor options={options.map((e) => e.label)} value={value} onChange={handleChange} />
      )}
    </EditScreenLayout>
  );
}
