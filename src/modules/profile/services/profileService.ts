import { supabase } from '@/shared/services/supabase/client';
import type { Profile } from '@/modules/profile/types/profile';
import type { TablesUpdate } from '@/shared/types/supabase';

const PROFILE_SELECT = `
  *,
  profile_photos (id, url, position, is_primary),
  profile_interests (interest_id),
  profile_languages (language_id)
`;

// PostgREST's embedded-relation select string isn't representable in the
// generated Database types, so the raw row is untyped here and normalized
// into the strict `Profile` shape immediately below.
function mapProfileRow(row: any): Profile {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    gender: row.gender,
    lookingFor: row.looking_for,
    birthDate: row.birth_date,
    bio: row.bio,
    heightCm: row.height_cm,
    profession: row.profession,
    country: row.country,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    avatarUrl: row.avatar_url,
    educationLevelId: row.education_level_id,
    religionId: row.religion_id,
    relationshipGoalId: row.relationship_goal_id,
    smoking: row.smoking,
    drinking: row.drinking,
    gymHabit: row.gym_habit,
    hasPets: row.has_pets,
    wantsChildren: row.wants_children,
    onboardingCompleted: row.onboarding_completed,
    profileCompleted: row.profile_completed,
    accountStatus: (row.account_status as Profile['accountStatus']) ?? 'active',
    statusReason: row.status_reason ?? null,
    isVerified: row.is_verified ?? false,
    notificationPrefs: (row.notification_prefs ?? {}) as Record<string, boolean>,
    privacyPrefs: (row.privacy_prefs ?? {}) as Record<string, boolean>,
    lastActiveAt: row.last_active_at ?? null,
    locationUpdatedAt: row.location_updated_at ?? null,
    photos: (row.profile_photos ?? [])
      .map((p: any) => ({ id: p.id, url: p.url, position: p.position, isPrimary: p.is_primary }))
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position),
    interestIds: (row.profile_interests ?? []).map((i: any) => i.interest_id),
    languageIds: (row.profile_languages ?? []).map((l: any) => l.language_id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchOwnProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select(PROFILE_SELECT).eq('id', userId).single();
  if (error) throw error;
  return mapProfileRow(data);
}

/**
 * Another member's profile, through the get_public_profile RPC — profiles
 * RLS is owner-only, so a direct select on someone else's row returns
 * nothing. The RPC exposes a vetted column list (no email, no coordinates,
 * age instead of birth date) and only active, completed profiles.
 */
async function fetchPublicProfile(profileId: string): Promise<Profile> {
  const { data, error } = await supabase.rpc('get_public_profile', { p_profile_id: profileId });
  if (error) throw error;
  const row = data?.[0];
  if (!row) throw new Error('Profil introuvable ou indisponible.');

  // January 1st of (currentYear - age) always re-derives exactly `age`,
  // letting the shared display pipeline work without the real birth date.
  const syntheticBirthDate = row.age != null ? `${new Date().getFullYear() - row.age}-01-01` : null;

  return {
    id: row.id,
    email: null,
    firstName: row.first_name,
    lastName: null,
    gender: row.gender,
    lookingFor: null,
    birthDate: syntheticBirthDate,
    bio: row.bio,
    heightCm: row.height_cm,
    profession: row.profession,
    country: row.country,
    city: row.city,
    latitude: null,
    longitude: null,
    avatarUrl: row.avatar_url,
    educationLevelId: row.education_level_id,
    religionId: row.religion_id,
    relationshipGoalId: null,
    smoking: (row.smoking as Profile['smoking']) ?? null,
    drinking: (row.drinking as Profile['drinking']) ?? null,
    gymHabit: (row.gym_habit as Profile['gymHabit']) ?? null,
    hasPets: (row.has_pets as Profile['hasPets']) ?? null,
    wantsChildren: (row.wants_children as Profile['wantsChildren']) ?? null,
    onboardingCompleted: true,
    profileCompleted: true,
    accountStatus: 'active',
    statusReason: null,
    isVerified: row.is_verified,
    notificationPrefs: {},
    privacyPrefs: {},
    lastActiveAt: row.last_active_at,
    locationUpdatedAt: null,
    distanceKm: row.distance_km ?? null,
    photos: (row.photo_urls ?? []).map((url: string, index: number) => ({
      id: url,
      url,
      position: index,
      isPrimary: index === 0,
    })),
    interestIds: row.interest_ids ?? [],
    languageIds: row.language_ids ?? [],
    createdAt: '',
    updatedAt: '',
  };
}

async function updateProfile(userId: string, patch: TablesUpdate<'profiles'>): Promise<void> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

async function setInterests(userId: string, interestIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase.from('profile_interests').delete().eq('profile_id', userId);
  if (deleteError) throw deleteError;

  if (interestIds.length === 0) return;
  const { error: insertError } = await supabase
    .from('profile_interests')
    .insert(interestIds.map((interestId) => ({ profile_id: userId, interest_id: interestId })));
  if (insertError) throw insertError;
}

async function setLanguages(userId: string, languageIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase.from('profile_languages').delete().eq('profile_id', userId);
  if (deleteError) throw deleteError;

  if (languageIds.length === 0) return;
  const { error: insertError } = await supabase
    .from('profile_languages')
    .insert(languageIds.map((languageId) => ({ profile_id: userId, language_id: languageId })));
  if (insertError) throw insertError;
}

/** Alimente le compteur « Vues » de Mon profil — best effort, jamais bloquant. */
async function recordProfileView(profileId: string): Promise<void> {
  const { error } = await supabase.rpc('record_profile_view', { p_profile_id: profileId });
  if (error) throw error;
}

export const profileService = {
  fetchOwnProfile,
  fetchPublicProfile,
  updateProfile,
  setInterests,
  setLanguages,
  recordProfileView,
};
