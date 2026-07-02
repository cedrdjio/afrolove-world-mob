import { useMutation } from '@tanstack/react-query';
import { authService } from '@/modules/auth/services/authService';
import { useAuthStore } from '@/modules/auth/stores/authStore';

export function useResetPassword() {
  return useMutation({
    mutationFn: (password: string) => authService.updatePassword(password),
    // The recovery flag has served its purpose once the password is changed;
    // leaving it set would keep routing the user back to this screen.
    onSuccess: () => useAuthStore.getState().setPendingAction(null),
  });
}
