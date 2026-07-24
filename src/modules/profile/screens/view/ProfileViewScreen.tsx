import { View, Alert } from 'react-native';
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
import { useDeckStore } from '@/modules/discovery/stores/deckStore';

export function ProfileViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const profileQuery = useOtherProfileQuery(id);
  const profileError = useAppError(profileQuery.error);
  const displayData = useProfileDisplayData(profileQuery.data);
  const swipe = useSwipe();
  const favoriteIds = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  // Traiter un profil depuis la fiche le retire du deck Découverte : au retour,
  // on tombe directement sur le profil suivant (et non plus sur le même).
  const consume = useDeckStore((s) => s.consume);

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
  // Dans tous les cas de succès on « consomme » le profil : la Découverte,
  // toujours montée dessous, passe directement au suivant.
  const handleLike = () => {
    if (swipe.isPending) return;
    swipe.mutate(
      { targetId: profile.id, action: 'like' },
      {
        onSuccess: ({ isMatch }) => {
          consume(profile.id);
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
        // Sans gestion d'erreur, atteindre la limite gratuite rendait le
        // bouton « J'aime » muet — l'appui semblait ne rien faire du tout.
        onError: (error) => {
          const message = error instanceof Error ? error.message : '';
          if (message.includes('SWIPE_LIMIT_REACHED') || message.includes('LIKE_LIMIT_REACHED')) {
            router.push({ pathname: '/discover-like-limit', params: { reason: 'swipes' } });
          } else {
            Alert.alert('Erreur', "Votre J'aime n'a pas pu être enregistré. Réessayez.");
          }
        },
      },
    );
  };

  // Dislike depuis la fiche : enregistre le pass, retire le profil du deck,
  // puis revient à la Découverte sur le profil suivant.
  const handlePass = () => {
    if (swipe.isPending) {
      router.back();
      return;
    }
    swipe.mutate(
      { targetId: profile.id, action: 'pass' },
      {
        onSuccess: () => {
          consume(profile.id);
          router.back();
        },
        onError: () => {
          // Un pass qui échoue ne doit pas bloquer l'utilisateur sur la fiche.
          consume(profile.id);
          router.back();
        },
      },
    );
  };

  const isFavorite = favoriteIds.has(profile.id);

  // Favori depuis la fiche : on garde le profil de côté ET on avance au suivant
  // (« comme une faveur »), au lieu de rester bloqué sur la même fiche.
  const handleToggleFavorite = () => {
    if (toggleFavorite.isPending) return;
    toggleFavorite.mutate(
      { targetId: profile.id, isFavorite },
      {
        onSuccess: () => {
          consume(profile.id);
          router.back();
        },
        onError: () => Alert.alert('Erreur', "L'action n'a pas pu être enregistrée. Réessayez."),
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
      onPass={handlePass}
      isFavorite={isFavorite}
      onToggleFavorite={handleToggleFavorite}
    />
  );
}
