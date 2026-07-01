import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/shared/services/supabase/client';

WebBrowser.maybeCompleteAuthSession();

export interface EmailCredentials {
  email: string;
  password: string;
}

async function signUpWithEmail({ email, password, firstName }: EmailCredentials & { firstName: string }) {
  console.log('[authService] signUpWithEmail →', { email, firstName });
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { first_name: firstName } },
  });
  if (error) {
    console.error('[authService] signUpWithEmail ✗', error);
    throw error;
  }
  console.log('[authService] signUpWithEmail ✓', { userId: data.user?.id, session: !!data.session });
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
  resendSignupEmail,
  setSessionFromTokens,
};
