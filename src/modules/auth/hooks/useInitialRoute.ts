import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useNetworkStore } from '@/shared/stores/networkStore';
import type { Href } from 'expo-router';

/**
 * Single source of truth for "where should the app land right now" —
 * consulted once at boot (Splash) and again after login/logout/onboarding
 * completion. Returns null while still resolving (session check, profile
 * fetch); callers should keep showing a loader until a route comes back.
 */
export function useInitialRoute(): Href | null {
  const { status } = useAuth();
  const isOffline = useNetworkStore((s) => s.isOffline);
  const profileQuery = useProfileQuery();

  if (status === 'idle') return null;
  if (status === 'unauthenticated') return '/(auth)/welcome';

  // Authenticated from here on.
  if (!profileQuery.data) {
    return profileQuery.isError && !isOffline ? '/system/server-error' : null;
  }

  return profileQuery.data.onboarding_completed ? '/(tabs)/discover' : '/(onboarding)/carousel';
}
