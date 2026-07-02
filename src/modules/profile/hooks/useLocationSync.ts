import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useProfileQuery, PROFILE_QUERY_KEY } from '@/modules/profile/hooks/useProfileQuery';
import { locationService } from '@/modules/profile/services/locationService';

const LOCATION_STALE_MS = 24 * 60 * 60 * 1000;

/**
 * Mounted once inside the signed-in area. Marks the user active (feeds the
 * "En ligne" chip) and refreshes the stored position at most once a day so
 * proximity search stays accurate without spamming the GPS.
 */
export function useLocationSync() {
  const { user } = useAuth();
  const profileQuery = useProfileQuery();
  const queryClient = useQueryClient();
  const syncedForUser = useRef<string | null>(null);

  const profile = profileQuery.data;

  useEffect(() => {
    if (!user || !profile || syncedForUser.current === user.id) return;
    syncedForUser.current = user.id;

    locationService.touchLastActive(user.id).catch(() => {});

    const lastUpdate = profile.locationUpdatedAt ? new Date(profile.locationUpdatedAt).getTime() : 0;
    if (Date.now() - lastUpdate > LOCATION_STALE_MS) {
      locationService.captureAndSaveLocation(user.id).then((saved) => {
        if (saved) {
          queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, user.id] });
        }
      });
    }
  }, [user, profile, queryClient]);
}
