import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/services/supabase/client';
import { useAuth } from '@/modules/auth/hooks/useAuth';

/** Vrai si le compte connecté a un rôle admin (RPC is_admin, côté base). */
export function useIsAdmin(): boolean {
  const { user, isAuthenticated } = useAuth();
  const query = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) return false;
      return data === true;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
  return query.data ?? false;
}
