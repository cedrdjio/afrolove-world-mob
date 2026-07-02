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
    isVerified: row.is_verified ?? false,
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

async function fetchProfileById(profileId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select(PROFILE_SELECT).eq('id', profileId).single();
  if (error) throw error;
  return mapProfileRow(data);
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

export const profileService = {
  fetchOwnProfile,
  fetchProfileById,
  updateProfile,
  setInterests,
  setLanguages,
};
