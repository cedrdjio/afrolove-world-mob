import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { premiumService } from '@/modules/premium/services/premiumService';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const ENTITLEMENTS_QUERY_KEY = 'entitlements' as const;
export const FAVORITES_QUERY_KEY = 'favorites' as const;
export const FAVORITE_IDS_QUERY_KEY = 'favorite-ids' as const;
export const LIKERS_QUERY_KEY = 'likers' as const;

export function usePremiumPlans() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['premium-plans'],
    queryFn: premiumService.fetchPlans,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });
}

export function useEntitlements() {
  const { user, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [ENTITLEMENTS_QUERY_KEY, user?.id],
    queryFn: premiumService.fetchEntitlements,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function usePurchasePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { planKey: string; phone: string; paymentMethod?: string }) =>
      premiumService.purchasePlan(input),
    onSuccess: (result) => {
      // Only a settled payment changes entitlements; canceled/pending leave the
      // current state untouched. Premium unlocks limits and the likers list
      // everywhere at once.
      if (result.outcome === 'succeeded') {
        queryClient.invalidateQueries({ queryKey: [ENTITLEMENTS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [LIKERS_QUERY_KEY] });
      }
    },
  });
}

export function useFavorites() {
  const { user, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [FAVORITES_QUERY_KEY, user?.id],
    queryFn: premiumService.fetchFavorites,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

/** Ensemble des ids de profils déjà en favori (pour l'état du bouton Discover). */
export function useFavoriteIds() {
  const { user, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [FAVORITE_IDS_QUERY_KEY, user?.id],
    queryFn: premiumService.fetchFavoriteIds,
    enabled: isAuthenticated,
    staleTime: 30_000,
    select: (ids) => new Set(ids),
  });
}

/**
 * Ajoute / retire un favori. La garde premium vit dans la RPC add_favorite
 * (lève PREMIUM_REQUIRED) ; l'appelant intercepte cette erreur pour ouvrir le
 * paywall. onSuccess rafraîchit la liste et l'état des boutons.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ targetId, isFavorited }: { targetId: string; isFavorited: boolean }) =>
      isFavorited ? premiumService.removeFavorite(targetId) : premiumService.addFavorite(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FAVORITE_IDS_QUERY_KEY] });
    },
  });
}

export function useLikers(enabled: boolean) {
  const { user, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [LIKERS_QUERY_KEY, user?.id],
    queryFn: premiumService.fetchLikers,
    enabled: isAuthenticated && enabled,
    staleTime: 30_000,
  });
}
