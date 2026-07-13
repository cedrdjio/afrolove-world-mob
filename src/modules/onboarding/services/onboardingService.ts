import { photoService } from '@/modules/profile/services/photoService';
import { profileService } from '@/modules/profile/services/profileService';
import type { LifestyleValues } from '@/shared/constants/lifestyle';
import type { Gender, LookingForOption } from '@/modules/onboarding/stores/onboardingStore';

const MAX_PHOTOS = 6;

export interface CompleteOnboardingInput {
  userId: string;
  /** Prénom réel — requis pour la vérification d'identité (KYC). */
  firstName: string;
  /** Nom de famille réel — requis pour la vérification d'identité (KYC). */
  lastName: string;
  gender: Gender;
  birthDate: { day: string; month: string; year: string };
  lookingFor: LookingForOption;
  bio: string;
  interestIds: string[];
  lifestyle: LifestyleValues;
  /** Local device URIs picked via expo-image-picker, compressed and
   *  uploaded to Storage below. */
  photoUris: string[];
}

function toIsoBirthDate({ day, month, year }: CompleteOnboardingInput['birthDate']): string {
  const pad = (value: string) => value.padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * Idempotent : refaire l'onboarding (après un reset de mot de passe, un
 * crash au premier passage…) ne doit jamais échouer parce que le compte a
 * déjà des photos. L'ancienne version uploadait les photos EN PREMIER —
 * la limite de 6 photos levait alors une erreur avant même d'enregistrer
 * le profil, et `onboarding_completed` restait à false pour toujours :
 * l'utilisateur rebouclait sur l'onboarding à chaque connexion.
 *
 * Ordre désormais : profil d'abord (c'est lui qui ouvre l'accès à l'app),
 * puis intérêts, puis photos en respectant la place restante.
 */
async function completeOnboarding(input: CompleteOnboardingInput): Promise<void> {
  await profileService.updateProfile(input.userId, {
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim() || null,
    gender: input.gender,
    looking_for: input.lookingFor,
    birth_date: toIsoBirthDate(input.birthDate),
    bio: input.bio,
    smoking: input.lifestyle.smoking,
    drinking: input.lifestyle.drinking,
    gym_habit: input.lifestyle.gymHabit,
    has_pets: input.lifestyle.hasPets,
    wants_children: input.lifestyle.wantsChildren,
    onboarding_completed: true,
  });

  await profileService.setInterests(input.userId, input.interestIds);

  // Uploaded one at a time (not Promise.all): the enforce_single_primary
  // and sync_profile_avatar triggers on profile_photos touch sibling rows,
  // so parallel inserts here risk lock contention. Each call checks its own
  // session (see photoService.getUploadAuthHeaders) and the object write
  // itself goes through the upload-photo Edge Function's S3 credentials
  // rather than the per-request JWT/RLS path.
  const existingPhotos = await photoService.fetchPhotos(input.userId).catch(() => []);
  const room = Math.max(0, MAX_PHOTOS - existingPhotos.length);
  const urisToUpload = input.photoUris.slice(0, room);

  let uploaded = 0;
  let firstUploadError: unknown = null;
  for (const [index, uri] of urisToUpload.entries()) {
    try {
      await photoService.addPhoto(uri, existingPhotos.length + index);
      uploaded += 1;
    } catch (error) {
      firstUploadError = firstUploadError ?? error;
    }
  }

  // Un compte sans aucune photo ne peut pas être découvert : dans ce cas
  // uniquement, l'échec d'upload doit remonter pour que l'utilisateur
  // réessaie. S'il a déjà des photos (re-onboarding), on n'échoue pas.
  if (existingPhotos.length === 0 && uploaded === 0 && firstUploadError) {
    throw firstUploadError;
  }
}

export const onboardingService = {
  completeOnboarding,
};
