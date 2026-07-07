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
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useProfileDisplayData } from '@/modules/profile/hooks/useProfileDisplayData';
import { profileService } from '@/modules/profile/services/profileService';
import { ProfileDetailView } from '@/modules/profile/components/ProfileDetailView';
import { useSwipe } from '@/modules/discovery/hooks/useDiscovery';
import { useConversationsQuery } from '@/modules/messaging/hooks/useMessaging';

export function ProfileViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const profileQuery = useOtherProfileQuery(id);
  const profileError = useAppError(profileQuery.error);
  const displayData = useProfileDisplayData(profileQuery.data);
  const swipe = useSwipe();

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

  // Compatibilité affichée = même formule que le deck (search_profiles) :
  // 50 % de base + la part d'intérêts en commun, plafonnée à 99.
  const discoveryStats = useMemo(() => {
    if (!profile || !myProfileQuery.data) return null;
    const mine = new Set(myProfileQuery.data.interestIds);
    const common = profile.interestIds.filter((interestId) => mine.has(interestId)).length;
    const compatibility = Math.min(99, Math.max(50, 50 + Math.round((common * 49) / Math.max(mine.size, 1))));
    return { compatibility, commonInterests: common };
  }, [profile, myProfileQuery.data]);

  if (!profile || !displayData) return <FullScreenLoader />;

  const matchWithProfile = (conversationsQuery.data ?? []).find((c) => c.partnerId === profile.id);

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
        onError: (error) => {
          // Les plafonds gratuits (15 swipes/jour, 10 favoris) sont levés par
          // le trigger BD — on route vers l'écran forfaits correspondant.
          const message = error instanceof Error ? error.message : '';
          if (message.includes('SWIPE_LIMIT_REACHED') || message.includes('LIKE_LIMIT_REACHED')) {
            router.push({ pathname: '/discover-like-limit', params: { reason: 'swipes' } });
          } else if (message.includes('FAVORITES_LIMIT_REACHED')) {
            router.push({ pathname: '/discover-like-limit', params: { reason: 'favorites' } });
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
      discoveryStats={discoveryStats ?? undefined}
      onGalleryPress={() => router.push(`/profile/${profile.id}/gallery`)}
      onLike={handleLike}
      onMessage={matchWithProfile ? () => router.push(`/chat/${matchWithProfile.matchId}`) : undefined}
    />
  );
}
