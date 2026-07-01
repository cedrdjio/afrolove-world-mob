import { useLocalSearchParams, useRouter } from 'expo-router';
import { FullScreenLoader } from '@/shared/components/feedback';
import { useOtherProfileQuery } from '@/modules/profile/hooks/useOtherProfileQuery';
import { useProfileDisplayData } from '@/modules/profile/hooks/useProfileDisplayData';
import { ProfileDetailView } from '@/modules/profile/components/ProfileDetailView';

export function ProfileViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const profileQuery = useOtherProfileQuery(id);
  const displayData = useProfileDisplayData(profileQuery.data);

  if (!profileQuery.data || !displayData) return <FullScreenLoader />;

  return (
    <ProfileDetailView
      profile={profileQuery.data}
      displayData={displayData}
      variant="discovery"
      onGalleryPress={() => router.push(`/profile/${profileQuery.data.id}/gallery`)}
      onLike={() => router.push('/matches/celebration')}
    />
  );
}
