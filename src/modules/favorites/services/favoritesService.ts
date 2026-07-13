import { supabase } from '@/shared/services/supabase/client';

/**
 * Favoris = signets. Rien à voir avec un like : on met de côté un profil
 * croisé dans Découvrir pour le retrouver plus tard (onglet Favoris de
 * Mes Matches). Table profile_favorites, invisible pour la personne mise
 * en favori. 10 favoris gratuits, illimités en Premium.
 */
export interface SavedFavorite {
  id: string;
  firstName: string;
  avatarUrl: string | null;
  city: string | null;
  isVerified: boolean;
  savedAt: string;
}

async function fetchSavedFavorites(): Promise<SavedFavorite[]> {
  const { data, error } = await supabase.rpc('get_saved_favorites');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.profile_id,
    firstName: row.first_name ?? '',
    avatarUrl: row.avatar_url,
    city: row.city,
    isVerified: row.is_verified,
    savedAt: row.saved_at,
  }));
}

async function fetchFavoriteIds(): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_my_favorite_ids');
  if (error) throw error;
  return (data ?? []).map((row) => row.target_id);
}

async function addFavorite(targetId: string): Promise<void> {
  const { error } = await supabase.rpc('add_favorite', { p_target_id: targetId });
  if (error) throw error;
}

async function removeFavorite(targetId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_favorite', { p_target_id: targetId });
  if (error) throw error;
}

export const favoritesService = {
  fetchSavedFavorites,
  fetchFavoriteIds,
  addFavorite,
  removeFavorite,
};
