import { useMutation } from '@tanstack/react-query';
import { authService } from '@/modules/auth/services/authService';
import { useAuthStore } from '@/modules/auth/stores/authStore';

export function useResetPassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      await authService.updatePassword(password);
      // A recovery deep link signs the user in with a temporary recovery
      // session. Once the new password is set, end that session so the user
      // re-authenticates cleanly with it on the Login screen — otherwise the
      // recovery session keeps them signed in and drops them straight into
      // the app / onboarding without ever proving the new credential.
      await authService.signOut();
    },
    // signOut fires SIGNED_OUT which clears pendingAction; set it here too so
    // the flag is gone even if the sign-out event is delayed.
    onSuccess: () => useAuthStore.getState().setPendingAction(null),
  });
}
