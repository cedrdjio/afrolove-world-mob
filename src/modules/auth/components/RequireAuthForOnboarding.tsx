import { Redirect } from 'expo-router';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { FullScreenLoader } from '@/shared/components/feedback';

/** Guards the onboarding flow: must be signed in, and if onboarding is
 *  already complete there's nothing left to do here — send to Home. */
export function RequireAuthForOnboarding({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const profileQuery = useProfileQuery();

  if (status === 'idle') return <FullScreenLoader />;
  if (status === 'unauthenticated') return <Redirect href="/(auth)/welcome" />;
  if (profileQuery.isPending) return <FullScreenLoader />;
  if (profileQuery.data?.onboarding_completed) return <Redirect href="/(tabs)/discover" />;

  return children;
}
