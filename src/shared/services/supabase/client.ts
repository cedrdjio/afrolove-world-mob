import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { secureStoreAdapter } from '@/shared/services/supabase/secureStoreAdapter';
import type { Database } from '@/shared/types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://xhpwmondzarbnzciruis.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_m7deqa--hK3BofZbiTzcuQ_6Q1wrzyn';

// Signup/login can trigger server-side email sending and take longer than a
// typical read, so the client timeout has headroom above GoTrue's own budget.
const REQUEST_TIMEOUT_MS = 30_000;

// Every request gets a hard timeout so a stalled connection surfaces as a
// clear "Timeout" AppError instead of a screen that spins forever. Aborting
// with an explicit reason keeps the resulting error message identifiable
// even after Supabase wraps it into its own AuthError/AuthApiError classes.
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new Error('Request timed out')),
    REQUEST_TIMEOUT_MS,
  );

  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: fetchWithTimeout,
  },
});

// GoTrue's auto-refresh timer only ticks while the JS runtime is active.
// Tying it to AppState means the refresh token is renewed the moment the
// app returns to the foreground, and stops burning cycles in the background.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
