import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Briefcase } from 'lucide-react-native';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { Skeleton, ErrorState } from '@/shared/components/feedback';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useUpdateProfile } from '@/modules/profile/hooks/useUpdateProfile';
import { useAppError } from '@/shared/hooks/useAppError';

export function EditJobScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const updateProfile = useUpdateProfile();
  const updateProfileError = useAppError(updateProfile.error);
  const [job, setJob] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profileQuery.data && !initialized) {
      setJob(profileQuery.data.profession ?? '');
      setInitialized(true);
    }
  }, [profileQuery.data, initialized]);

  const handleSave = () => {
    updateProfile.mutate({ profession: job }, { onSuccess: () => router.back() });
  };

  return (
    <EditScreenLayout
      title="Profession"
      onSave={handleSave}
      saveLabel={updateProfile.isPending ? 'Enregistrement…' : 'Enregistrer'}
      scrollable={false}
    >
      {updateProfileError ? (
        <View className="mb-4">
          <ErrorState error={updateProfileError} variant="inline" onRetry={handleSave} />
        </View>
      ) : null}

      {profileQuery.isPending ? (
        <Skeleton width="100%" height={64} radius={16} />
      ) : (
        <GlassInput
          label="Métier"
          icon={<Briefcase size={15} color="rgba(62,53,82,0.26)" />}
          placeholder="Votre profession"
          value={job}
          onChangeText={setJob}
        />
      )}
    </EditScreenLayout>
  );
}
