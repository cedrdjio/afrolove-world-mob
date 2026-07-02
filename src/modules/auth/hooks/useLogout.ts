import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/modules/auth/services/authService';
import { useAuthStore } from '@/modules/auth/stores/authStore';
import { pushService } from '@/modules/notifications/services/pushService';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Stop pushes to this account's devices before the session dies —
      // afterwards RLS would refuse the delete.
      const userId = useAuthStore.getState().user?.id;
      if (userId) await pushService.unregisterAllDevices(userId);
      await authService.signOut();
    },
    onSuccess: () => queryClient.clear(),
  });
}
