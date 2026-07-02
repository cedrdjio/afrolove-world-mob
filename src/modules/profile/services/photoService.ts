import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '@/shared/services/supabase/client';
import type { ProfilePhoto } from '@/modules/profile/types/profile';

const PHOTOS_BUCKET = 'profile-photos';
const MAX_DIMENSION = 1080;
const COMPRESSION_QUALITY = 0.75;

async function compressPhoto(uri: string): Promise<string> {
  const image = await ImageManipulator.manipulate(uri).resize({ width: MAX_DIMENSION }).renderAsync();
  const result = await image.saveAsync({ compress: COMPRESSION_QUALITY, format: SaveFormat.JPEG });
  return result.uri;
}

function mapPhoto(row: { id: string; url: string; position: number; is_primary: boolean }): ProfilePhoto {
  return { id: row.id, url: row.url, position: row.position, isPrimary: row.is_primary };
}

// Storage uploads have intermittently failed with a row-level security
// violation even though the RLS policies themselves are confirmed correct
// (verified directly against the database, bypassing the app entirely).
// That points at the client not attaching a valid access token to the
// upload request specifically. Logging the session state right before the
// call — dev-only — turns the next occurrence into hard evidence instead
// of another guess.
async function logSessionBeforeUpload(label: string): Promise<void> {
  if (!__DEV__) return;
  const { data, error } = await supabase.auth.getSession();
  // eslint-disable-next-line no-console
  console.log(`[photoService] ${label} session check`, {
    hasSession: !!data.session,
    hasAccessToken: !!data.session?.access_token,
    expiresAt: data.session?.expires_at,
    error: error?.message,
  });
}

async function fetchPhotos(profileId: string): Promise<ProfilePhoto[]> {
  const { data, error } = await supabase
    .from('profile_photos')
    .select('id, url, position, is_primary')
    .eq('profile_id', profileId)
    .order('position', { ascending: true });
  if (error) throw error;
  return data.map(mapPhoto);
}

/** Compresses, uploads, and inserts a new photo row in one call, reporting
 *  0-100 upload progress via onProgress for the caller's progress bar. */
async function addPhoto(
  profileId: string,
  localUri: string,
  position: number,
  onProgress?: (percent: number) => void,
): Promise<ProfilePhoto> {
  onProgress?.(5);
  const compressedUri = await compressPhoto(localUri);
  onProgress?.(35);

  const arrayBuffer = await fetch(compressedUri).then((res) => res.arrayBuffer());
  onProgress?.(55);

  const path = `${profileId}/${Date.now()}.jpg`;
  await logSessionBeforeUpload('addPhoto');
  const { error: uploadError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) throw uploadError;
  onProgress?.(85);

  const publicUrl = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl;

  const { data, error } = await supabase
    .from('profile_photos')
    .insert({ profile_id: profileId, url: publicUrl, position, is_primary: position === 0 })
    .select('id, url, position, is_primary')
    .single();
  if (error) throw error;

  onProgress?.(100);
  return mapPhoto(data);
}

async function deletePhoto(photoId: string): Promise<void> {
  const { error } = await supabase.from('profile_photos').delete().eq('id', photoId);
  if (error) throw error;
}

async function replacePhoto(photoId: string, localUri: string, onProgress?: (percent: number) => void): Promise<ProfilePhoto> {
  onProgress?.(5);
  const compressedUri = await compressPhoto(localUri);
  onProgress?.(35);

  const arrayBuffer = await fetch(compressedUri).then((res) => res.arrayBuffer());
  onProgress?.(55);

  const { data: existing, error: fetchError } = await supabase
    .from('profile_photos')
    .select('profile_id')
    .eq('id', photoId)
    .single();
  if (fetchError) throw fetchError;

  const path = `${existing.profile_id}/${Date.now()}.jpg`;
  await logSessionBeforeUpload('replacePhoto');
  const { error: uploadError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) throw uploadError;
  onProgress?.(85);

  const publicUrl = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl;

  const { data, error } = await supabase
    .from('profile_photos')
    .update({ url: publicUrl })
    .eq('id', photoId)
    .select('id, url, position, is_primary')
    .single();
  if (error) throw error;

  onProgress?.(100);
  return mapPhoto(data);
}

/** Persists a full reorder; the first photo in the list becomes the
 *  primary one (and thus the avatar, via the DB trigger). Runs sequentially
 *  — the is_primary trigger touches sibling rows, so parallel writes here
 *  could deadlock. */
async function reorderPhotos(photos: ProfilePhoto[]): Promise<void> {
  for (const [index, photo] of photos.entries()) {
    const { error } = await supabase
      .from('profile_photos')
      .update({ position: index, is_primary: index === 0 })
      .eq('id', photo.id);
    if (error) throw error;
  }
}

export const photoService = {
  fetchPhotos,
  addPhoto,
  deletePhoto,
  replacePhoto,
  reorderPhotos,
};
