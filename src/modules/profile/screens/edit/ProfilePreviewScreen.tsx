import { useRouter } from 'expo-router';
import { FullScreenLoader } from '@/shared/components/feedback';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useProfileDisplayData } from '@/modules/profile/hooks/useProfileDisplayData';
import { ProfileDetailView } from '@/modules/profile/components/ProfileDetailView';

/** Shows the signed-in user exactly what other members see of their
 *  profile — same presentational component as the real Discovery detail
 *  view, just fed the user's own data and without the like/report actions. */
export function ProfilePreviewScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const displayData = useProfileDisplayData(profileQuery.data);

  if (!profileQuery.data || !displayData) return <FullScreenLoader />;

  return (
    <ProfileDetailView
      profile={profileQuery.data}
      displayData={displayData}
      variant="preview"
      onGalleryPress={() => router.push(`/profile/${profileQuery.data.id}/gallery`)}
    />
  );
}
