import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/modules/auth/services/authService';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => queryClient.clear(),
  });
}
