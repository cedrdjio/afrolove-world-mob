import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/modules/profile/services/profileService';

/** Fetches any other user's profile for the Discovery detail view — same
 *  shape as useProfileQuery, but through the get_public_profile RPC since
 *  profiles RLS is owner-only. */
export function useOtherProfileQuery(profileId: string | undefined) {
  return useQuery({
    queryKey: ['public-profile', profileId],
    queryFn: () => profileService.fetchPublicProfile(profileId!),
    enabled: Boolean(profileId),
  });
}
