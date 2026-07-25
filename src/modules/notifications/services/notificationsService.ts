import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/shared/services/supabase/client';

/** 'admin' = annonces diffusées depuis le back-office. */
export type NotificationType = 'match' | 'message' | 'like' | 'kyc' | 'admin';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

async function fetchNotifications(profileId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, body, data, read_at, created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(60);
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    body: row.body,
    data: (row.data ?? {}) as Record<string, unknown>,
    read: row.read_at != null,
    createdAt: row.created_at,
  }));
}

async function markAllRead(profileId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('profile_id', profileId)
    .is('read_at', null);
  if (error) throw error;
}

/**
 * Flux temps réel des nouvelles notifications (la table est dans la
 * publication supabase_realtime ; la RLS s'applique aux lignes reçues).
 * C'est ce qui fait arriver instantanément les annonces envoyées depuis le
 * dashboard. L'appelant doit unsubscribe() au démontage.
 */
function subscribeToNotifications(profileId: string, onInsert: () => void): RealtimeChannel {
  // Topic UNIQUE par abonnement : avec un topic fixe, un remontage rapide de
  // l'écran (retour de paiement, navigation) récupérait la même instance de
  // canal déjà abonnée, et l'ajout d'un callback postgres_changes après
  // subscribe() faisait planter toute l'app (« cannot add postgres_changes
  // callbacks … after subscribe() » → ErrorBoundary → retour au login).
  const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return supabase
    .channel(`notifications:${profileId}:${unique}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `profile_id=eq.${profileId}` },
      () => onInsert(),
    )
    .subscribe();
}

function unsubscribe(channel: RealtimeChannel): void {
  supabase.removeChannel(channel).catch(() => {});
}

export const notificationsService = {
  fetchNotifications,
  markAllRead,
  subscribeToNotifications,
  unsubscribe,
};
