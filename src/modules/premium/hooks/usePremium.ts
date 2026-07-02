import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { premiumService } from '@/modules/premium/services/premiumService';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const ENTITLEMENTS_QUERY_KEY = 'entitlements' as const;
export const FAVORITES_QUERY_KEY = 'favorites' as const;
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
    mutationFn: (planKey: string) => premiumService.purchasePlan(planKey),
    onSuccess: () => {
      // Premium unlocks limits and the likers list everywhere at once.
      queryClient.invalidateQueries({ queryKey: [ENTITLEMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [LIKERS_QUERY_KEY] });
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

export function useLikers(enabled: boolean) {
  const { user, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [LIKERS_QUERY_KEY, user?.id],
    queryFn: premiumService.fetchLikers,
    enabled: isAuthenticated && enabled,
    staleTime: 30_000,
  });
}
