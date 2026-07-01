import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { secureStoreAdapter } from '@/shared/services/supabase/secureStoreAdapter';
import type { Database } from '@/shared/types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://xhpwmondzarbnzciruis.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_m7deqa--hK3BofZbiTzcuQ_6Q1wrzyn';

const REQUEST_TIMEOUT_MS = 15_000;

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

// Every request gets a hard timeout so a stalled connection surfaces as a
// clear "Timeout" AppError instead of a screen that spins forever.
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const url = requestUrl(input);
  const method = init?.method ?? 'GET';
  const startedAt = Date.now();

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    console.warn(`[supabase] ${method} ${url} timed out after ${REQUEST_TIMEOUT_MS}ms, aborting`);
    controller.abort(new Error(`Request to ${url} timed out after ${REQUEST_TIMEOUT_MS}ms`));
  }, REQUEST_TIMEOUT_MS);

  console.log(`[supabase] → ${method} ${url}`);

  return fetch(input, { ...init, signal: controller.signal })
    .then((response) => {
      console.log(`[supabase] ← ${response.status} ${method} ${url} (${Date.now() - startedAt}ms)`);
      return response;
    })
    .catch((error) => {
      console.error(`[supabase] ✗ ${method} ${url} failed after ${Date.now() - startedAt}ms:`, error);
      throw error;
    })
    .finally(() => clearTimeout(timeout));
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
