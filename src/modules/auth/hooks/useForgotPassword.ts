import { useMutation } from '@tanstack/react-query';
import { authService } from '@/modules/auth/services/authService';
import { useAuthStore } from '@/modules/auth/stores/authStore';
import { AUTH_CALLBACK_URL } from '@/modules/auth/constants/authLinks';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.sendPasswordResetEmail(email, AUTH_CALLBACK_URL),
  });
}

/**
 * Vérifie le code reçu par email (type recovery) directement dans l'app :
 * contrairement au lien, ce chemin ne dépend pas du retour navigateur → app.
 * Une fois la session de récupération établie, le flag `recovery` force le
 * routage vers l'écran Nouveau mot de passe jusqu'à ce qu'il soit changé.
 */
export function useVerifyRecoveryOtp() {
  return useMutation({
    mutationFn: ({ email, token }: { email: string; token: string }) =>
      authService.verifyRecoveryOtp(email, token),
    onSuccess: (_, { email }) => useAuthStore.getState().setPendingAction({ type: 'recovery', email }),
  });
}
