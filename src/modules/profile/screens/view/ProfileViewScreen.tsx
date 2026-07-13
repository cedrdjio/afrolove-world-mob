import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';
import { FullScreenLoader, ErrorState } from '@/shared/components/feedback';
import { ScreenBackground } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { colors } from '@/shared/constants/theme';
import { useAppError } from '@/shared/hooks/useAppError';
import { useOtherProfileQuery } from '@/modules/profile/hooks/useOtherProfileQuery';
import { useProfileDisplayData } from '@/modules/profile/hooks/useProfileDisplayData';
import { ProfileDetailView } from '@/modules/profile/components/ProfileDetailView';
import { useSwipe } from '@/modules/discovery/hooks/useDiscovery';
import { useFavoriteIds, useToggleFavorite } from '@/modules/favorites/hooks/useSavedFavorites';

export function ProfileViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const profileQuery = useOtherProfileQuery(id);
  const profileError = useAppError(profileQuery.error);
  const displayData = useProfileDisplayData(profileQuery.data);
  const swipe = useSwipe();
  const favoriteIds = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  // L'écran restait bloqué sur un loader infini quand la requête échouait
  // (RPC indisponible, profil supprimé, hors-ligne…) — sans même un bouton
  // retour. On affiche maintenant un vrai état d'erreur avec retry.
  if (profileQuery.isError && profileError) {
    return (
      <View className="flex-1">
        <ScreenBackground theme="cream" />
        <View className="absolute left-[18px] top-14 z-10">
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
          </IconButton>
        </View>
        <ErrorState error={profileError} onRetry={() => profileQuery.refetch()} />
      </View>
    );
  }

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

  const isFavorite = favoriteIds.has(profile.id);

  return (
    <ProfileDetailView
      profile={profile}
      displayData={displayData}
      variant="discovery"
      onGalleryPress={() => router.push(`/profile/${profile.id}/gallery`)}
      onLike={handleLike}
      isFavorite={isFavorite}
      onToggleFavorite={() => {
        if (toggleFavorite.isPending) return;
        toggleFavorite.mutate({ targetId: profile.id, isFavorite });
      }}
    />
  );
}
