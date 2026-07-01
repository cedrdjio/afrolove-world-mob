import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { FullScreenLoader } from '@/shared/components/feedback';
import { useInitialRoute } from '@/modules/auth/hooks/useInitialRoute';

/**
 * Thin loading gate used right after any action that changes where the user
 * should land (login, email verification, onboarding completion) — it
 * shares the exact same resolution logic as the boot Splash screen so
 * "authenticated but onboarding incomplete" vs. "fully set up" is decided
 * in one place only.
 */
export function AuthResolvingScreen() {
  const router = useRouter();
  const initialRoute = useInitialRoute();

  useEffect(() => {
    if (initialRoute) {
      router.replace(initialRoute);
    }
  }, [initialRoute, router]);

  return <FullScreenLoader />;
}
