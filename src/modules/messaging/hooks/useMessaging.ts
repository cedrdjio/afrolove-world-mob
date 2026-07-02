import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messagingService } from '@/modules/messaging/services/messagingService';
import type { ChatMessage } from '@/modules/messaging/types/messaging';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const CONVERSATIONS_QUERY_KEY = 'conversations' as const;
export const MESSAGES_QUERY_KEY = 'messages' as const;

export function useConversationsQuery() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [CONVERSATIONS_QUERY_KEY, user?.id],
    queryFn: () => messagingService.fetchConversations(user!.id),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 15_000,
  });
}

/**
 * Messages of one conversation, kept live: the initial page comes from the
 * query, then Realtime inserts are appended straight into the cache — no
 * polling, no refetch on every message.
 */
export function useMessagesQuery(matchId: string | undefined) {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [MESSAGES_QUERY_KEY, matchId],
    queryFn: () => messagingService.fetchMessages(matchId!),
    enabled: isAuthenticated && Boolean(matchId),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!matchId || !isAuthenticated) return;

    const channel = messagingService.subscribeToMessages(matchId, (message) => {
      queryClient.setQueryData<ChatMessage[]>([MESSAGES_QUERY_KEY, matchId], (current) => {
        if (!current) return [message];
        // The sender already appended it optimistically — dedupe by id.
        if (current.some((m) => m.id === message.id)) return current;
        return [...current, message];
      });
      // An incoming partner message while the chat is open is read instantly.
      if (message.senderId !== user?.id) {
        messagingService.markConversationRead(matchId).catch(() => {});
        queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
      }
    });

    return () => messagingService.unsubscribe(channel);
  }, [matchId, isAuthenticated, queryClient, user?.id]);

  return query;
}

export function useSendMessage(matchId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => {
      if (!user || !matchId) throw new Error('Conversation indisponible');
      return messagingService.sendMessage(matchId, user.id, content);
    },
    onSuccess: (message) => {
      queryClient.setQueryData<ChatMessage[]>([MESSAGES_QUERY_KEY, matchId], (current) => {
        if (!current) return [message];
        if (current.some((m) => m.id === message.id)) return current;
        return [...current, message];
      });
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
    },
  });
}

/** Marks the partner's messages read when the chat opens. */
export function useMarkConversationRead(matchId: string | undefined, unreadHint?: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId) return;
    messagingService
      .markConversationRead(matchId)
      .then(() => queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] }))
      .catch(() => {});
    // unreadHint re-triggers when new unread arrive while the screen stays mounted
  }, [matchId, unreadHint, queryClient]);
}
