import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/modules/profile/services/profileService';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const PROFILE_QUERY_KEY = 'profile' as const;

/** The current user's own `profiles` row — the single source of truth for
 *  whether onboarding is complete and thus whether Home is reachable. */
export function useProfileQuery() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [PROFILE_QUERY_KEY, user?.id],
    queryFn: () => profileService.fetchOwnProfile(user!.id),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 60_000,
  });
}
