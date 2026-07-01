import { useMutation } from '@tanstack/react-query';
import { authService, type EmailCredentials } from '@/modules/auth/services/authService';

interface RegisterInput extends EmailCredentials {
  firstName: string;
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => authService.signUpWithEmail(input),
  });
}
