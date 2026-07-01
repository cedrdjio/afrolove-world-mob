import { Redirect } from 'expo-router';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { FullScreenLoader } from '@/shared/components/feedback';

/**
 * Guards every screen under (tabs) — the "real app". Protects against a
 * user landing here directly (deep link, restored web URL, stale nav
 * state) without going through the Splash/AuthResolving redirect chain
 * first. Unauthenticated or onboarding-incomplete users are bounced out
 * immediately; nothing under this layout is ever reachable otherwise.
 */
export function RequireCompletedOnboarding({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const profileQuery = useProfileQuery();

  if (status === 'idle') return <FullScreenLoader />;
  if (status === 'unauthenticated') return <Redirect href="/(auth)/welcome" />;
  if (!profileQuery.data) {
    return profileQuery.isError ? <Redirect href="/system/server-error" /> : <FullScreenLoader />;
  }
  if (!profileQuery.data.onboarding_completed) return <Redirect href="/(onboarding)/carousel" />;

  return children;
}
