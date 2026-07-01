import { useEffect } from 'react';
import { useAuthStore } from '@/modules/auth/stores/authStore';

/** Boots the auth listener once at the app root. Call this exactly once. */
export function useInitializeAuth() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);
}

export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);

  return {
    status,
    session,
    user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'idle',
  };
}
