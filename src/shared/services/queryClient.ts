import { QueryClient, QueryCache, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/shared/services/supabase/client';
import { mapToAppError } from '@/shared/utils/errorMapping';

// Wires React Query's online/offline detection to the device's real network
// state, so queries and mutations automatically pause while offline and
// re-fire the moment connectivity returns — no manual retry wiring needed.
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
  });
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
  // Any query hitting an expired/invalid refresh token forces a sign-out
  // from one place, so every screen's auth guard picks it up and redirects
  // to Welcome instead of showing stale, unauthorized data.
  queryCache: new QueryCache({
    onError: (error) => {
      if (mapToAppError(error).kind === 'session_expired') {
        supabase.auth.signOut().catch(() => {});
      }
    },
  }),
});
