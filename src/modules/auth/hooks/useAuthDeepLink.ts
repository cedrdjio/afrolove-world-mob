import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { getQueryParams } from 'expo-auth-session/build/QueryParams';
import { authService } from '@/modules/auth/services/authService';
import { useAuthStore } from '@/modules/auth/stores/authStore';

/**
 * Every Supabase auth email (signup confirmation, password recovery) redirects
 * to AUTH_CALLBACK_URL with the resulting session appended as
 * `#access_token=...&refresh_token=...&type=signup|recovery`. This hook
 * catches that link — whether the app was already running or just launched
 * cold from it — exchanges the tokens for a live session, and routes the
 * user to email-verification success or the reset-password screen.
 */
export function useAuthDeepLink() {
  const router = useRouter();
  const setPendingAction = useAuthStore((s) => s.setPendingAction);
  const url = Linking.useURL();
  const handledUrls = useRef(new Set<string>());

  useEffect(() => {
    if (!url || handledUrls.current.has(url)) return;

    const { params, errorCode } = getQueryParams(url);

    // Expired or already-used links come back as
    // `#error=access_denied&error_code=otp_expired&...` with no tokens.
    // Silently ignoring them left the user stranded on whatever screen was
    // open — land them on Login with an explanation instead. Skip the
    // redirect when a session is already live (e.g. tapping a stale link
    // while signed in) so it can't yank an active user out of the app.
    const linkError = errorCode ?? params.error_code ?? params.error;
    if (linkError) {
      handledUrls.current.add(url);
      if (useAuthStore.getState().status !== 'authenticated') {
        router.replace({ pathname: '/(auth)/login', params: { linkError } });
      }
      return;
    }

    if (!params.access_token || !params.refresh_token) return;

    handledUrls.current.add(url);

    authService
      .setSessionFromTokens(params.access_token, params.refresh_token)
      .then(() => {
        if (params.type === 'recovery') {
          setPendingAction({ type: 'recovery' });
          router.replace('/(auth)/reset-password');
        } else if (params.type === 'signup') {
          router.replace('/(auth)/success');
        } else if (params.type === 'email_change') {
          // Lien de confirmation du changement d'email : sans ce cas, le tap
          // ouvrait l'app sans aucun retour visible et l'utilisateur ne
          // savait pas si son adresse avait réellement changé.
          Alert.alert('Email confirmé', 'Votre nouvelle adresse email est maintenant active.');
          router.replace('/settings/account');
        }
      })
      .catch(() => {
        router.replace('/(auth)/login');
      });
  }, [url, router, setPendingAction]);
}
