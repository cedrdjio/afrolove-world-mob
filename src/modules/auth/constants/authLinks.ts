import * as Linking from 'expo-linking';

/**
 * Single deep link every Supabase auth email (signup confirmation, password
 * recovery) redirects back to. Must be added to Supabase's Auth →
 * URL Configuration → Redirect URLs allow list — see the Sprint 1 report
 * for the exact manual dashboard steps.
 */
export const AUTH_CALLBACK_URL = Linking.createURL('auth/callback');
