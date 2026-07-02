import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { kycService, type SubmitKycInput } from '@/modules/kyc/services/kycService';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { PROFILE_QUERY_KEY } from '@/modules/profile/hooks/useProfileQuery';

export const KYC_QUERY_KEY = 'kyc-submission' as const;

/** Latest KYC submission (or null if the user never submitted). */
export function useKycSubmission() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [KYC_QUERY_KEY, user?.id],
    queryFn: () => kycService.fetchLatestSubmission(user!.id),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 30_000,
  });
}

export function useSubmitKyc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, onProgress }: { input: SubmitKycInput; onProgress?: (p: number) => void }) =>
      kycService.submit(input, onProgress),
    onSuccess: (_, { input }) => {
      queryClient.invalidateQueries({ queryKey: [KYC_QUERY_KEY, input.profileId] });
      // is_verified lives on the profile row; refresh it when review lands.
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, input.profileId] });
    },
  });
}
