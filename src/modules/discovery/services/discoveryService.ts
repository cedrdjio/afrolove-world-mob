import { supabase } from '@/shared/services/supabase/client';
import type { DiscoveryFilters, DiscoveryProfile, SwipeAction } from '@/modules/discovery/types/discovery';

const DECK_SIZE = 25;

interface SearchProfilesRow {
  id: string;
  first_name: string | null;
  age: number;
  city: string | null;
  country: string | null;
  bio: string | null;
  is_verified: boolean;
  avatar_url: string | null;
  distance_km: number | null;
  compatibility: number;
  interest_names: string[] | null;
}

function mapRow(row: SearchProfilesRow): DiscoveryProfile {
  return {
    id: row.id,
    firstName: row.first_name ?? '',
    age: row.age,
    city: row.city,
    country: row.country,
    bio: row.bio,
    isVerified: row.is_verified,
    avatarUrl: row.avatar_url,
    distanceKm: row.distance_km,
    compatibility: row.compatibility,
    interestNames: row.interest_names ?? [],
  };
}

async function searchProfiles(filters: DiscoveryFilters): Promise<DiscoveryProfile[]> {
  const { data, error } = await supabase.rpc('search_profiles', {
    p_age_min: filters.ageMin,
    p_age_max: filters.ageMax,
    p_max_distance_km: filters.maxDistanceKm ?? undefined,
    p_verified_only: filters.verifiedOnly,
    p_new_only: filters.mode === 'new',
    p_online_recently: filters.mode === 'online',
    p_limit: DECK_SIZE,
  });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/**
 * Records the swipe and reports whether it just completed a mutual like.
 * The match row itself is created by the `after_swipe_sync_match` DB trigger —
 * this only observes the outcome, so clients can never forge a match.
 */
async function swipe(swiperId: string, targetId: string, action: SwipeAction): Promise<{ isMatch: boolean }> {
  const { error } = await supabase
    .from('swipes')
    .upsert({ swiper_id: swiperId, target_id: targetId, action }, { onConflict: 'swiper_id,target_id' });
  if (error) throw error;

  if (action === 'pass') return { isMatch: false };

  const [a, b] = swiperId < targetId ? [swiperId, targetId] : [targetId, swiperId];
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('id')
    .eq('profile_a', a)
    .eq('profile_b', b)
    .maybeSingle();
  if (matchError) throw matchError;

  return { isMatch: Boolean(match) };
}

/** Free-text search (name / city / country) over the whole discoverable pool. */
async function searchByText(query: string): Promise<DiscoveryProfile[]> {
  const { data, error } = await supabase.rpc('search_profiles', {
    p_query: query,
    p_limit: 40,
  });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export const discoveryService = {
  searchProfiles,
  swipe,
  searchByText,
};
