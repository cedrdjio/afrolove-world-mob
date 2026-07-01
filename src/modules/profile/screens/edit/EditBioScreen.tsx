import { useEffect, useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { Skeleton, ErrorState } from '@/shared/components/feedback';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useUpdateProfile } from '@/modules/profile/hooks/useUpdateProfile';
import { mapToAppError } from '@/shared/utils/errorMapping';

const MAX_LENGTH = 300;

export function EditBioScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const updateProfile = useUpdateProfile();
  const [bio, setBio] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profileQuery.data && !initialized) {
      setBio(profileQuery.data.bio ?? '');
      setInitialized(true);
    }
  }, [profileQuery.data, initialized]);

  const handleSave = () => {
    updateProfile.mutate({ bio }, { onSuccess: () => router.back() });
  };

  return (
    <EditScreenLayout
      title="Bio"
      subtitle="Présentez-vous en quelques mots authentiques."
      onSave={handleSave}
      saveLabel={updateProfile.isPending ? 'Enregistrement…' : 'Enregistrer'}
    >
      {updateProfile.isError ? (
        <View className="mb-4">
          <ErrorState error={mapToAppError(updateProfile.error)} variant="inline" onRetry={handleSave} />
        </View>
      ) : null}

      {profileQuery.isPending ? (
        <Skeleton width="100%" height={180} radius={16} />
      ) : (
        <>
          <View className="rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-4" style={{ minHeight: 180 }}>
            <TextInput
              value={bio}
              onChangeText={(text) => setBio(text.slice(0, MAX_LENGTH))}
              multiline
              textAlignVertical="top"
              placeholder="Parlez de vous…"
              placeholderTextColor="rgba(26,8,4,0.25)"
              className="flex-1 font-body text-[14px] leading-[21px] text-ink"
            />
          </View>
          <Text className="mt-2 text-right font-body text-[11px] text-ink/30">
            {bio.length}/{MAX_LENGTH}
          </Text>
        </>
      )}
    </EditScreenLayout>
  );
}
