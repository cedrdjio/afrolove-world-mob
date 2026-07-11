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
  const interestIds = useFiltersStore((s) => s.interestIds);

  return useQuery({
    queryKey: ['discovery', mode, distanceKm, ageMin, ageMax, verifiedOnly, interestIds],
    queryFn: () =>
      discoveryService.searchProfiles({
        ageMin,
        ageMax,
        maxDistanceKm: distanceKm,
        verifiedOnly,
        mode,
        interestIds,
      }),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

/** Compteur live du bouton « Voir N profils » de l'écran Filtres. */
export function useDiscoveryCount() {
  const { isAuthenticated } = useAuth();
  const distanceKm = useFiltersStore((s) => s.distanceKm);
  const ageMin = useFiltersStore((s) => s.ageMin);
  const ageMax = useFiltersStore((s) => s.ageMax);
  const verifiedOnly = useFiltersStore((s) => s.verifiedOnly);
  const interestIds = useFiltersStore((s) => s.interestIds);

  return useQuery({
    queryKey: ['discovery-count', distanceKm, ageMin, ageMax, verifiedOnly, interestIds],
    queryFn: () =>
      discoveryService.countProfiles({ ageMin, ageMax, maxDistanceKm: distanceKm, verifiedOnly, interestIds }),
    enabled: isAuthenticated,
    staleTime: 30_000,
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
      // A swipe consumes quota (free-tier limits live in the DB trigger).
      queryClient.invalidateQueries({ queryKey: ['entitlements'] });
      if (result.isMatch) {
        queryClient.invalidateQueries({ queryKey: ['matches'] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });
}
