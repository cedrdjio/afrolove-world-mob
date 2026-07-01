import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/modules/profile/services/profileService';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { PROFILE_QUERY_KEY } from '@/modules/profile/hooks/useProfileQuery';
import type { TablesUpdate } from '@/shared/types/supabase';

/** Generic "patch my own profile" mutation — every edit screen (bio,
 *  height, profession, religion, lifestyle, ...) reuses this instead of
 *  hand-rolling its own Supabase call. */
export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: TablesUpdate<'profiles'>) => profileService.updateProfile(user!.id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, user?.id] }),
  });
}

export function useUpdateInterests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (interestIds: string[]) => profileService.setInterests(user!.id, interestIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, user?.id] }),
  });
}

export function useUpdateLanguages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (languageIds: string[]) => profileService.setLanguages(user!.id, languageIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, user?.id] }),
  });
}
