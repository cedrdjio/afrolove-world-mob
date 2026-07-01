import { useMutation } from '@tanstack/react-query';
import { authService } from '@/modules/auth/services/authService';
import { AUTH_CALLBACK_URL } from '@/modules/auth/constants/authLinks';

export function useVerifySignupOtp() {
  return useMutation({
    mutationFn: ({ email, token }: { email: string; token: string }) => authService.verifySignupOtp(email, token),
  });
}

export function useResendSignupEmail() {
  return useMutation({
    mutationFn: (email: string) => authService.resendSignupEmail(email, AUTH_CALLBACK_URL),
  });
}
