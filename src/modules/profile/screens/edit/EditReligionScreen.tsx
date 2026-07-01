import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChoiceListEditor } from '@/shared/components/ui/ChoiceListEditor';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { Skeleton, ErrorState } from '@/shared/components/feedback';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useReligionsQuery } from '@/modules/profile/hooks/useReferenceData';
import { useUpdateProfile } from '@/modules/profile/hooks/useUpdateProfile';
import { mapToAppError } from '@/shared/utils/errorMapping';

export function EditReligionScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const religionsQuery = useReligionsQuery();
  const updateProfile = useUpdateProfile();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profileQuery.data && !initialized) {
      setSelectedId(profileQuery.data.religionId);
      setInitialized(true);
    }
  }, [profileQuery.data, initialized]);

  const options = religionsQuery.data ?? [];
  const value = options.find((r) => r.id === selectedId)?.label ?? '';

  const handleChange = (label: string) => {
    const match = options.find((r) => r.label === label);
    setSelectedId(match?.id ?? null);
  };

  const handleSave = () => {
    updateProfile.mutate({ religion_id: selectedId }, { onSuccess: () => router.back() });
  };

  return (
    <EditScreenLayout
      title="Religion"
      onSave={handleSave}
      saveLabel={updateProfile.isPending ? 'Enregistrement…' : 'Enregistrer'}
    >
      {updateProfile.isError ? (
        <View className="mb-4">
          <ErrorState error={mapToAppError(updateProfile.error)} variant="inline" onRetry={handleSave} />
        </View>
      ) : null}

      {profileQuery.isPending || religionsQuery.isPending ? (
        <View className="gap-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={54} radius={16} />
          ))}
        </View>
      ) : (
        <ChoiceListEditor options={options.map((r) => r.label)} value={value} onChange={handleChange} />
      )}
    </EditScreenLayout>
  );
}
