import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/services/supabase/client';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export interface ProfileStats {
  likesReceived: number;
  matchesCount: number;
  matchRate: number;
}

/** Likes reçus / matches / taux, computed server-side by `get_my_profile_stats`. */
export function useProfileStats() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['profile-stats', user?.id],
    queryFn: async (): Promise<ProfileStats> => {
      const { data, error } = await supabase.rpc('get_my_profile_stats');
      if (error) throw error;
      const row = data?.[0];
      return {
        likesReceived: row?.likes_received ?? 0,
        matchesCount: row?.matches_count ?? 0,
        matchRate: row?.match_rate ?? 0,
      };
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
