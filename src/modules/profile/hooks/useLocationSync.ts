import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useProfileQuery, PROFILE_QUERY_KEY } from '@/modules/profile/hooks/useProfileQuery';
import { locationService } from '@/modules/profile/services/locationService';

const LOCATION_STALE_MS = 24 * 60 * 60 * 1000;
// Le dashboard considère « en ligne » = actif il y a moins de 5 min. Un
// battement toutes les 2 min (et à chaque retour au premier plan) garde ce
// compteur juste tant que l'app reste ouverte — avant, last_active_at n'était
// écrit qu'une fois au lancement, donc les « connectés » étaient faux.
const HEARTBEAT_MS = 2 * 60 * 1000;

/**
 * Mounted once inside the signed-in area. Marks the user active (feeds the
 * "En ligne" chip and the dashboard "connectés" stat) on a heartbeat, and
 * refreshes the stored position at most once a day so proximity search stays
 * accurate without spamming the GPS.
 */
export function useLocationSync() {
  const { user } = useAuth();
  const profileQuery = useProfileQuery();
  const queryClient = useQueryClient();
  const locationSyncedForUser = useRef<string | null>(null);

  const profile = profileQuery.data;
  const userId = user?.id;

  // Battement d'activité : immédiat, périodique, et à chaque retour au premier
  // plan. Découplé de la synchro GPS pour ne pas dépendre du chargement profil.
  useEffect(() => {
    if (!userId) return;

    const beat = () => locationService.touchLastActive(userId).catch(() => {});
    beat();

    const interval = setInterval(beat, HEARTBEAT_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') beat();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [userId]);

  // Rafraîchissement de la position, au plus une fois par jour.
  useEffect(() => {
    if (!userId || !profile || locationSyncedForUser.current === userId) return;
    locationSyncedForUser.current = userId;

    const lastUpdate = profile.locationUpdatedAt ? new Date(profile.locationUpdatedAt).getTime() : 0;
    if (Date.now() - lastUpdate > LOCATION_STALE_MS) {
      locationService.captureAndSaveLocation(userId).then((saved) => {
        if (saved) {
          queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, userId] });
        }
      });
    }
  }, [userId, profile, queryClient]);
}
