import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/modules/profile/services/profileService';

/** Fetches any other user's profile for the Discovery detail view — same
 *  shape as useProfileQuery, but keyed by an explicit profile id instead
 *  of "whoever is signed in". */
export function useOtherProfileQuery(profileId: string | undefined) {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => profileService.fetchProfileById(profileId!),
    enabled: Boolean(profileId),
  });
}
