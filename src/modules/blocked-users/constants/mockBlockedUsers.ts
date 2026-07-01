export interface BlockedUser {
  id: string;
  name: string;
  blockedOn: string;
}

export const MOCK_BLOCKED_USERS: BlockedUser[] = [
  { id: '6', name: 'Ibrahim', blockedOn: '12 mai 2026' },
  { id: '7', name: 'Grace', blockedOn: '28 avril 2026' },
];
