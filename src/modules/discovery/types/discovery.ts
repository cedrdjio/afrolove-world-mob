export type SwipeAction = 'like' | 'pass' | 'super_like';

/** One card of the discovery deck, as returned by the `search_profiles` RPC. */
export interface DiscoveryProfile {
  id: string;
  firstName: string;
  age: number;
  city: string | null;
  country: string | null;
  bio: string | null;
  isVerified: boolean;
  avatarUrl: string | null;
  distanceKm: number | null;
  compatibility: number;
  interestNames: string[];
  /** Dernier signe de vie (heartbeat) — complété en direct par la présence Realtime. */
  lastActiveAt: string | null;
}

/** Chips above the deck — mapped onto RPC flags, not client-side filtering. */
export type DiscoveryFeedMode = 'all' | 'new' | 'online';

export interface DiscoveryFilters {
  ageMin: number;
  ageMax: number;
  maxDistanceKm: number | null;
  verifiedOnly: boolean;
  mode: DiscoveryFeedMode;
  /** Ids de la table interests ; vide = pas de filtre. */
  interestIds?: string[];
}
