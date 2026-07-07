import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/modules/notifications/services/notificationsService';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const NOTIFICATIONS_QUERY_KEY = 'notifications' as const;

/**
 * Abonnement Realtime aux notifications entrantes — sans lui, les envois du
 * dashboard n'apparaissaient qu'au refetch suivant (staleTime 30 s), jamais
 * en direct. Monté une fois dans le layout des onglets.
 */
export function useNotificationsRealtime() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const channel = notificationsService.subscribeToNotifications(user.id, () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    });

    return () => notificationsService.unsubscribe(channel);
  }, [isAuthenticated, user?.id, queryClient]);
}

export function useNotificationsQuery() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, user?.id],
    queryFn: () => notificationsService.fetchNotifications(user!.id),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 30_000,
  });
}

/** True when at least one notification is unread — drives the bell badge. */
export function useHasUnreadNotifications(): boolean {
  const notificationsQuery = useNotificationsQuery();
  return (notificationsQuery.data ?? []).some((n) => !n.read);
}

export function useMarkAllNotificationsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Session invalide');
      return notificationsService.markAllRead(user.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] }),
  });
}
