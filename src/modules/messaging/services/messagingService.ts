import { supabase } from '@/shared/services/supabase/client';
import type { ChatMessage, Conversation } from '@/modules/messaging/types/messaging';
import type { RealtimeChannel } from '@supabase/supabase-js';

function mapMessage(row: {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}): ChatMessage {
  return {
    id: row.id,
    matchId: row.match_id,
    senderId: row.sender_id,
    content: row.content,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

async function fetchConversations(myId: string): Promise<Conversation[]> {
  const { data, error } = await supabase.rpc('get_my_conversations');
  if (error) throw error;

  return (data ?? []).map((row) => ({
    matchId: row.match_id,
    matchedAt: row.matched_at,
    partnerId: row.partner_id,
    partnerFirstName: row.partner_first_name ?? '',
    partnerAvatarUrl: row.partner_avatar_url,
    partnerIsVerified: row.partner_is_verified,
    partnerLastActiveAt: row.partner_last_active_at,
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at,
    lastMessageFromMe: row.last_message_sender_id === myId,
    unreadCount: row.unread_count,
  }));
}

async function fetchMessages(matchId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, match_id, sender_id, content, created_at, read_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map(mapMessage);
}

async function sendMessage(matchId: string, senderId: string, content: string): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender_id: senderId, content })
    .select('id, match_id, sender_id, content, created_at, read_at')
    .single();
  if (error) throw error;
  return mapMessage(data);
}

async function markConversationRead(matchId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_messages_read', { p_match_id: matchId });
  if (error) throw error;
}

/**
 * Live inserts for one conversation, via Supabase Realtime (the messages
 * table is in the supabase_realtime publication; RLS still applies to what
 * each subscriber may receive). Returns the channel — callers must
 * removeChannel() on unmount or the socket leaks subscriptions.
 */
function subscribeToMessages(matchId: string, onMessage: (message: ChatMessage) => void): RealtimeChannel {
  return supabase
    .channel(`messages:${matchId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
      (payload) => {
        onMessage(mapMessage(payload.new as Parameters<typeof mapMessage>[0]));
      },
    )
    .subscribe();
}

function unsubscribe(channel: RealtimeChannel): void {
  supabase.removeChannel(channel).catch(() => {});
}

export const messagingService = {
  fetchConversations,
  fetchMessages,
  sendMessage,
  markConversationRead,
  subscribeToMessages,
  unsubscribe,
};
