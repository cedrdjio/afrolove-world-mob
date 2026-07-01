import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as Google from 'expo-auth-session/providers/google';
import { authService } from '@/modules/auth/services/authService';

/**
 * Google sign-in for Expo apps without a native Google Sign-In SDK: opens
 * Google's OAuth consent screen in a browser via expo-auth-session, gets
 * back an ID token, then hands it to Supabase's signInWithIdToken — no
 * extra native module or config plugin required.
 *
 * Requires EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID (see Sprint 1 report for
 * how to create it and enable the Google provider in Supabase).
 */
export function useGoogleAuth() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId,
  });

  const signInMutation = useMutation({
    mutationFn: (idToken: string) => authService.signInWithGoogleIdToken(idToken),
  });

  useEffect(() => {
    if (response?.type === 'success' && response.params.id_token) {
      signInMutation.mutate(response.params.id_token);
    }
  }, [response, signInMutation]);

  return {
    isReady: Boolean(request) && Boolean(webClientId),
    isConfigured: Boolean(webClientId),
    promptAsync,
    isPending: signInMutation.isPending,
    error: response?.type === 'error' ? response.error : signInMutation.error,
  };
}
