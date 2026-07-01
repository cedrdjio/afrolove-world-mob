import { useMutation } from '@tanstack/react-query';
import { authService } from '@/modules/auth/services/authService';

export function useResetPassword() {
  return useMutation({
    mutationFn: (password: string) => authService.updatePassword(password),
  });
}
