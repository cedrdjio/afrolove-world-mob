import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { discoveryService } from '@/modules/discovery/services/discoveryService';
import { useFiltersStore } from '@/modules/discovery/stores/filtersStore';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import type { DiscoveryFeedMode, SwipeAction } from '@/modules/discovery/types/discovery';

/**
 * The deck for the Discover screen. Every value of the filters store is part
 * of the query key, so changing a filter (or a chip) refetches immediately —
 * the filters sheet is wired straight into the search instead of being a
 * dead-end UI. Already-swiped profiles are excluded server-side, so a plain
 * refetch always yields fresh faces.
 */
export function useDiscoveryFeed(mode: DiscoveryFeedMode) {
  const { isAuthenticated } = useAuth();
  const distanceKm = useFiltersStore((s) => s.distanceKm);
  const ageMin = useFiltersStore((s) => s.ageMin);
  const ageMax = useFiltersStore((s) => s.ageMax);
  const verifiedOnly = useFiltersStore((s) => s.verifiedOnly);

  return useQuery({
    queryKey: ['discovery', mode, distanceKm, ageMin, ageMax, verifiedOnly],
    queryFn: () =>
      discoveryService.searchProfiles({ ageMin, ageMax, maxDistanceKm: distanceKm, verifiedOnly, mode }),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useSwipe() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetId, action }: { targetId: string; action: SwipeAction }) => {
      if (!user) throw new Error('Not authenticated');
      return discoveryService.swipe(user.id, targetId, action);
    },
    onSuccess: (result) => {
      if (result.isMatch) {
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
    },
  });
}
