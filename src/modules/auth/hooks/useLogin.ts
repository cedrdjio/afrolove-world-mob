import { useMutation } from '@tanstack/react-query';
import { authService, type EmailCredentials } from '@/modules/auth/services/authService';

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: EmailCredentials) => authService.signInWithEmail(credentials),
  });
}
