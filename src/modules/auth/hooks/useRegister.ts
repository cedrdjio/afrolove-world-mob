import { useMutation } from '@tanstack/react-query';
import { authService, type EmailCredentials } from '@/modules/auth/services/authService';

interface RegisterInput extends EmailCredentials {
  firstName: string;
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => {
      console.log('[useRegister] mutate →', input.email);
      return authService.signUpWithEmail(input);
    },
    onError: (error) => console.error('[useRegister] onError', error),
    onSuccess: (data) => console.log('[useRegister] onSuccess', { userId: data.user?.id }),
  });
}
