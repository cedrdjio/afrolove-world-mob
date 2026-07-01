import { supabase } from '@/shared/services/supabase/client';
import type { Profile } from '@/modules/profile/types/profile';

async function fetchOwnProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data as Profile;
}

export const profileService = {
  fetchOwnProfile,
};
