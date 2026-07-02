import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useAuthStore } from '@/modules/auth/stores/authStore';
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
  const pendingAction = useAuthStore((s) => s.pendingAction);
  const isOffline = useNetworkStore((s) => s.isOffline);
  const profileQuery = useProfileQuery();

  if (status === 'idle') return null;
  if (status === 'unauthenticated') return '/(auth)/welcome';

  // Authenticated from here on.

  // A recovery deep link signs the user in *before* they've chosen a new
  // password. Until useResetPassword clears the flag, every route resolution
  // must land on the reset screen — otherwise a splash/resolving pass racing
  // the deep-link handler would drop the user into the app and the reset
  // would silently never happen.
  if (pendingAction?.type === 'recovery') return '/(auth)/reset-password';
  if (!profileQuery.data) {
    return profileQuery.isError && !isOffline ? '/system/server-error' : null;
  }

  if (!profileQuery.data.onboardingCompleted) return '/(onboarding)/carousel';
  if (!profileQuery.data.profileCompleted) return '/profile-completion';

  return '/(tabs)/discover';
}
