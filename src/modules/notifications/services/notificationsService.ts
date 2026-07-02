import { supabase } from '@/shared/services/supabase/client';

export type NotificationType = 'match' | 'message' | 'like' | 'kyc';

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

export const notificationsService = {
  fetchNotifications,
  markAllRead,
};
