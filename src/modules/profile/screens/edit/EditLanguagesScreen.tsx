import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Chip } from '@/shared/components/ui/Chip';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { Skeleton, ErrorState } from '@/shared/components/feedback';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useLanguagesQuery } from '@/modules/profile/hooks/useReferenceData';
import { useUpdateLanguages } from '@/modules/profile/hooks/useUpdateProfile';
import { useAppError } from '@/shared/hooks/useAppError';

export function EditLanguagesScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const languagesQuery = useLanguagesQuery();
  const updateLanguages = useUpdateLanguages();
  const updateLanguagesError = useAppError(updateLanguages.error);
  const [selected, setSelected] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profileQuery.data && !initialized) {
      setSelected(profileQuery.data.languageIds);
      setInitialized(true);
    }
  }, [profileQuery.data, initialized]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const handleSave = () => {
    updateLanguages.mutate(selected, { onSuccess: () => router.back() });
  };

  return (
    <EditScreenLayout
      title="Langues"
      subtitle="Quelles langues parlez-vous ?"
      onSave={handleSave}
      saveDisabled={selected.length === 0}
      saveLabel={updateLanguages.isPending ? 'Enregistrement…' : 'Enregistrer'}
    >
      {updateLanguagesError ? (
        <View className="mb-4">
          <ErrorState error={updateLanguagesError} variant="inline" onRetry={handleSave} />
        </View>
      ) : null}

      <View className="flex-row flex-wrap gap-2.5">
        {profileQuery.isPending || languagesQuery.isPending
          ? Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} width={90} height={34} radius={17} />)
          : languagesQuery.data?.map((language) => (
              <Chip
                key={language.id}
                label={language.label}
                selected={selected.includes(language.id)}
                onPress={() => toggle(language.id)}
              />
            ))}
      </View>
    </EditScreenLayout>
  );
}
