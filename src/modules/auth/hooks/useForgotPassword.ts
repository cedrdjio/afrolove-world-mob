import { useMutation } from '@tanstack/react-query';
import { authService } from '@/modules/auth/services/authService';
import { AUTH_CALLBACK_URL } from '@/modules/auth/constants/authLinks';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.sendPasswordResetEmail(email, AUTH_CALLBACK_URL),
  });
}
