import { MOCK_PROFILES } from '@/modules/discovery/constants/mockProfiles';

export interface MockConversation {
  id: string;
  name: string;
  photoSeed: number;
  isNew: boolean;
  isOnline: boolean;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: '1',
    name: 'Amira',
    photoSeed: 1,
    isNew: true,
    isOnline: true,
    lastMessage: 'On devrait se retrouver ! ☕',
    timestamp: '3:44',
    unreadCount: 2,
  },
  {
    id: '4',
    name: 'Nadia',
    photoSeed: 4,
    isNew: true,
    isOnline: false,
    lastMessage: 'Tu es dispo ce weekend ? 🌍',
    timestamp: 'Hier',
    unreadCount: 0,
  },
  {
    id: '2',
    name: 'Kofi',
    photoSeed: 2,
    isNew: true,
    isOnline: true,
    lastMessage: 'Comment vas-tu aujourd\'hui ? 😊',
    timestamp: '9:12',
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Fatou',
    photoSeed: 3,
    isNew: false,
    isOnline: false,
    lastMessage: "C'était un plaisir de discuter avec toi !",
    timestamp: 'Lun',
    unreadCount: 0,
  },
  {
    id: '5',
    name: 'David',
    photoSeed: 5,
    isNew: false,
    isOnline: false,
    lastMessage: 'À bientôt alors 🌟',
    timestamp: '12/06',
    unreadCount: 0,
  },
];

export const NEW_MATCHES = MOCK_CONVERSATIONS.filter((c) => c.isNew);

export function getConversationById(id: string) {
  return MOCK_CONVERSATIONS.find((c) => c.id === id) ?? MOCK_CONVERSATIONS[0];
}

export function getProfileMatchPercent(id: string): number {
  return MOCK_PROFILES.find((p) => p.id === id)?.matchPercent ?? 90;
}
