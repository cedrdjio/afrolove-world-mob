import { Redirect } from 'expo-router';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { FullScreenLoader, ErrorState } from '@/shared/components/feedback';
import { useAppError } from '@/shared/hooks/useAppError';

/** Guards the onboarding flow: must be signed in, and if onboarding is
 *  already complete there's nothing left to do here — send to Home. */
export function RequireAuthForOnboarding({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const profileQuery = useProfileQuery();
  const profileError = useAppError(profileQuery.isError ? profileQuery.error : null);

  if (status === 'idle') return <FullScreenLoader />;
  if (status === 'unauthenticated') return <Redirect href="/(auth)/welcome" />;
  if (profileQuery.isPending) return <FullScreenLoader />;
  // A failed profile fetch used to fall through silently and render
  // onboarding with no profile data at all — surface it with a retry
  // instead of leaving the user stuck on a broken screen.
  if (profileError) return <ErrorState error={profileError} onRetry={() => profileQuery.refetch()} />;
  if (profileQuery.data?.onboardingCompleted) {
    return <Redirect href={profileQuery.data.profileCompleted ? '/(tabs)/discover' : '/profile-completion'} />;
  }

  return children;
}
