import { useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingService, type CompleteOnboardingInput } from '@/modules/onboarding/services/onboardingService';
import { PROFILE_QUERY_KEY } from '@/modules/profile/hooks/useProfileQuery';

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CompleteOnboardingInput) => onboardingService.completeOnboarding(input),
    // refetchType 'all' + promesse attendue : la query profil n'est pas
    // montée sur l'écran Finish, et sans refetch forcé l'écran de résolution
    // lisait le cache périmé (onboarding_completed=false) et renvoyait
    // l'utilisateur au début de l'onboarding qu'il venait de terminer.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY], refetchType: 'all' }),
  });
}
