/** One row of the conversation list — a match plus its latest message. */
export interface Conversation {
  matchId: string;
  matchedAt: string;
  partnerId: string;
  partnerFirstName: string;
  partnerAvatarUrl: string | null;
  partnerIsVerified: boolean;
  partnerLastActiveAt: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessageFromMe: boolean;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

const ONLINE_WINDOW_MS = 60 * 60 * 1000;

export function isRecentlyOnline(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_WINDOW_MS;
}
