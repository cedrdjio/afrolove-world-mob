import { useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingService, type CompleteOnboardingInput } from '@/modules/onboarding/services/onboardingService';
import { PROFILE_QUERY_KEY } from '@/modules/profile/hooks/useProfileQuery';

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CompleteOnboardingInput) => onboardingService.completeOnboarding(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] }),
  });
}
