import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '@/shared/services/supabase/client';
import type { ProfilePhoto } from '@/modules/profile/types/profile';

const UPLOAD_PHOTO_FUNCTION = 'upload-photo';
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

// Direct storage.upload() calls have intermittently failed with a row-level
// security violation even with a confirmed-valid session and RLS policies
// verified correct directly against the database — the wire request
// evidently doesn't always carry the token supabase-js believes it
// attached. The actual object write is now delegated to the upload-photo
// Edge Function, which authorizes it via the S3 protocol (credentials that
// never leave the server) instead of the per-request JWT/RLS path. This
// still needs a valid session — set the Authorization header explicitly
// rather than trusting functions.invoke()'s implicit attachment, since
// that shares the same underlying mechanism suspected of dropping it.
async function getUploadAuthHeaders(label: string): Promise<Record<string, string>> {
  const { data, error } = await supabase.auth.getSession();
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[photoService] ${label} session check`, {
      hasSession: !!data.session,
      hasAccessToken: !!data.session?.access_token,
      expiresAt: data.session?.expires_at,
      error: error?.message,
    });
  }
  if (!data.session?.access_token) {
    throw new Error('Session invalide : merci de vous reconnecter avant de continuer.');
  }
  return { Authorization: `Bearer ${data.session.access_token}` };
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

/** Compresses and uploads a new photo via the upload-photo Edge Function
 *  (which does the Storage write and the profile_photos insert in one
 *  call), reporting 0-100 upload progress via onProgress for the caller's
 *  progress bar. The profile is always the calling user's own — the
 *  function derives it from their JWT, not from anything the client sends. */
async function addPhoto(
  localUri: string,
  position: number,
  onProgress?: (percent: number) => void,
): Promise<ProfilePhoto> {
  onProgress?.(5);
  const compressedUri = await compressPhoto(localUri);
  onProgress?.(35);

  const arrayBuffer = await fetch(compressedUri).then((res) => res.arrayBuffer());
  onProgress?.(55);

  const authHeaders = await getUploadAuthHeaders('addPhoto');
  const { data, error } = await supabase.functions.invoke(UPLOAD_PHOTO_FUNCTION, {
    headers: { ...authHeaders, 'x-upload-mode': 'add', 'x-upload-position': String(position) },
    body: arrayBuffer,
  });
  if (error) throw error;
  onProgress?.(85);
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

  const authHeaders = await getUploadAuthHeaders('replacePhoto');
  const { data, error } = await supabase.functions.invoke(UPLOAD_PHOTO_FUNCTION, {
    headers: { ...authHeaders, 'x-upload-mode': 'replace', 'x-upload-photo-id': photoId },
    body: arrayBuffer,
  });
  if (error) throw error;
  onProgress?.(85);
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
