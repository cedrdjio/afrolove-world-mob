export type NotificationCategory = 'likes' | 'matches' | 'messages' | 'kyc' | 'premium' | 'system';

export interface MockNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  highlight: string;
  timeAgo: string;
  read: boolean;
  photoSeed?: number;
  emoji?: string;
  accentColor: string;
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: '1',
    category: 'likes',
    title: 'a aimé votre profil',
    highlight: 'Amira',
    timeAgo: 'Il y a 2 minutes',
    read: false,
    photoSeed: 1,
    accentColor: '#C86040',
  },
  {
    id: '2',
    category: 'matches',
    title: 'Nouveau match avec',
    highlight: 'Kofi !',
    timeAgo: 'Il y a 1 heure',
    read: false,
    photoSeed: 2,
    accentColor: '#C9862A',
  },
  {
    id: '3',
    category: 'messages',
    title: 'vous a envoyé un message',
    highlight: 'Kofi',
    timeAgo: 'Il y a 3 heures',
    read: true,
    photoSeed: 2,
    accentColor: '#7A9A7A',
  },
  {
    id: '4',
    category: 'kyc',
    title: 'Votre profil est vérifié',
    highlight: '',
    timeAgo: 'Il y a 1 jour',
    read: true,
    emoji: '✅',
    accentColor: '#4CAF50',
  },
  {
    id: '5',
    category: 'premium',
    title: 'AfroLove Premium',
    highlight: '',
    timeAgo: '7 jours gratuits · Likes illimités',
    read: true,
    emoji: '👑',
    accentColor: '#C9862A',
  },
  {
    id: '6',
    category: 'system',
    title: 'Mise à jour de nos conditions d\'utilisation',
    highlight: '',
    timeAgo: 'Il y a 3 jours',
    read: true,
    emoji: '📄',
    accentColor: '#7A5540',
  },
];

export const NOTIFICATION_FILTERS: { key: 'all' | NotificationCategory; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'likes', label: 'Likes' },
  { key: 'matches', label: 'Matches' },
  { key: 'messages', label: 'Messages' },
  { key: 'kyc', label: 'KYC' },
  { key: 'premium', label: 'Premium' },
  { key: 'system', label: 'Système' },
];
