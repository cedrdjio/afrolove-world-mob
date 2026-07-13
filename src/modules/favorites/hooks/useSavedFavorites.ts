import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { favoritesService } from '@/modules/favorites/services/favoritesService';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const SAVED_FAVORITES_KEY = 'saved-favorites' as const;
export const FAVORITE_IDS_KEY = 'favorite-ids' as const;

/** Liste complète pour l'onglet Favoris de Mes Matches. */
export function useSavedFavorites() {
  const { user, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [SAVED_FAVORITES_KEY, user?.id],
    queryFn: favoritesService.fetchSavedFavorites,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

/** Set des ids favoris — pour afficher l'état du signet sur les cartes. */
export function useFavoriteIds(): Set<string> {
  const { user, isAuthenticated } = useAuth();
  const query = useQuery({
    queryKey: [FAVORITE_IDS_KEY, user?.id],
    queryFn: favoritesService.fetchFavoriteIds,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
  return useMemo(() => new Set(query.data ?? []), [query.data]);
}

/** Ajoute/retire un favori, avec gestion de la limite gratuite (10). */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ targetId, isFavorite }: { targetId: string; isFavorite: boolean }) =>
      isFavorite ? favoritesService.removeFavorite(targetId) : favoritesService.addFavorite(targetId),
    onSuccess: (_, { isFavorite }) => {
      Haptics.impactAsync(
        isFavorite ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
      ).catch(() => {});
      queryClient.invalidateQueries({ queryKey: [SAVED_FAVORITES_KEY] });
      queryClient.invalidateQueries({ queryKey: [FAVORITE_IDS_KEY] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('FAVORITES_LIMIT_REACHED')) {
        Alert.alert(
          'Limite de favoris atteinte',
          'Vous avez 10 favoris. Passez Premium pour en garder autant que vous voulez.',
          [
            { text: 'Plus tard', style: 'cancel' },
            { text: 'Voir Premium', onPress: () => router.push('/premium') },
          ],
        );
      } else {
        Alert.alert('Erreur', "Le favori n'a pas pu être enregistré. Réessayez.");
      }
    },
  });
}
