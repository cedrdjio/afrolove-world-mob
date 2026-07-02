import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FullScreenLoader } from '@/shared/components/feedback';
import { useOtherProfileQuery } from '@/modules/profile/hooks/useOtherProfileQuery';
import { useProfileDisplayData } from '@/modules/profile/hooks/useProfileDisplayData';
import { ProfileDetailView } from '@/modules/profile/components/ProfileDetailView';
import { useSwipe } from '@/modules/discovery/hooks/useDiscovery';

export function ProfileViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const profileQuery = useOtherProfileQuery(id);
  const displayData = useProfileDisplayData(profileQuery.data);
  const swipe = useSwipe();

  if (!profileQuery.data || !displayData) return <FullScreenLoader />;

  const profile = profileQuery.data;

  // "J'aime" records a real swipe; the celebration only fires on an actual
  // mutual match (it used to open unconditionally without saving anything).
  const handleLike = () => {
    if (swipe.isPending) return;
    swipe.mutate(
      { targetId: profile.id, action: 'like' },
      {
        onSuccess: ({ isMatch }) => {
          if (isMatch) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            router.replace({
              pathname: '/matches/celebration',
              params: { id: profile.id, name: profile.firstName ?? '' },
            });
          } else {
            router.back();
          }
        },
      },
    );
  };

  return (
    <ProfileDetailView
      profile={profile}
      displayData={displayData}
      variant="discovery"
      onGalleryPress={() => router.push(`/profile/${profile.id}/gallery`)}
      onLike={handleLike}
    />
  );
}
