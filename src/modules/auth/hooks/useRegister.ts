import { useMutation } from '@tanstack/react-query';
import { authService, type EmailCredentials } from '@/modules/auth/services/authService';
import { AUTH_CALLBACK_URL } from '@/modules/auth/constants/authLinks';

type RegisterInput = EmailCredentials;

export function useRegister() {
  return useMutation({
    // Without redirectTo, the confirmation link in the *initial* signup email
    // falls back to the project Site URL instead of deep-linking back into
    // the app (the resend path already passed it — the two must match).
    mutationFn: (input: RegisterInput) => authService.signUpWithEmail({ ...input, redirectTo: AUTH_CALLBACK_URL }),
  });
}
