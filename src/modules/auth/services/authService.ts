import * as WebBrowser from 'expo-web-browser';
import { AuthApiError } from '@supabase/supabase-js';
import { supabase } from '@/shared/services/supabase/client';

WebBrowser.maybeCompleteAuthSession();

export interface EmailCredentials {
  email: string;
  password: string;
}

async function signUpWithEmail({
  email,
  password,
  redirectTo,
}: EmailCredentials & { redirectTo: string }) {
  // Pas de nom à l'inscription : le pseudo est collecté dans l'onboarding.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
  // With email confirmation enabled, GoTrue anti-enumeration returns a fake
  // user (no identities) instead of an error when the email is already
  // registered. Left as-is, the app would send the user to the OTP screen to
  // wait for a code that will never arrive — surface it as the same
  // "already registered" error the API uses elsewhere.
  if (data.user && !data.session && (data.user.identities?.length ?? 0) === 0) {
    throw new AuthApiError('User already registered', 400, 'user_already_exists');
  }
  return data;
}

async function signInWithEmail({ email, password }: EmailCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signInWithGoogleIdToken(idToken: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
  if (error) throw error;
  return data;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

async function sendPasswordResetEmail(email: string, redirectTo: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

async function verifySignupOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
  if (error) throw error;
  return data;
}

/**
 * Le lien email ouvre le navigateur et ne revient pas toujours dans l'app —
 * le code à saisir dans l'app, lui, fonctionne partout. Le même email de
 * récupération contient les deux.
 */
async function verifyRecoveryOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
  if (error) throw error;
  return data;
}

async function resendSignupEmail(email: string, redirectTo: string) {
  const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: redirectTo } });
  if (error) throw error;
}

async function setSessionFromTokens(accessToken: string, refreshToken: string) {
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) throw error;
  return data;
}

export const authService = {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogleIdToken,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  verifySignupOtp,
  verifyRecoveryOtp,
  resendSignupEmail,
  setSessionFromTokens,
};
