import { supabase } from '@/shared/services/supabase/client';
import type { Gender, LookingForOption } from '@/modules/onboarding/stores/onboardingStore';

const PHOTOS_BUCKET = 'profile-photos';

export interface CompleteOnboardingInput {
  userId: string;
  firstName: string;
  gender: Gender;
  birthDate: { day: string; month: string; year: string };
  lookingFor: LookingForOption;
  interests: string[];
  lifestyle: Record<string, string>;
  /** Local device URIs picked via expo-image-picker, uploaded to Storage below. */
  photoUris: string[];
}

async function uploadPhoto(userId: string, uri: string, index: number): Promise<string> {
  const arrayBuffer = await fetch(uri).then((res) => res.arrayBuffer());
  const extension = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const path = `${userId}/${Date.now()}-${index}.${extension}`;

  const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, arrayBuffer, {
    contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
    upsert: true,
  });
  if (error) throw error;

  return supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl;
}

function toIsoBirthDate({ day, month, year }: CompleteOnboardingInput['birthDate']): string {
  const pad = (value: string) => value.padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}

async function completeOnboarding(input: CompleteOnboardingInput) {
  const photoUrls = await Promise.all(input.photoUris.map((uri, index) => uploadPhoto(input.userId, uri, index)));

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: input.firstName,
      gender: input.gender,
      looking_for: input.lookingFor,
      birth_date: toIsoBirthDate(input.birthDate),
      interests: input.interests,
      lifestyle: input.lifestyle,
      photos: photoUrls,
      onboarding_completed: true,
    })
    .eq('id', input.userId);

  if (error) throw error;
}

export const onboardingService = {
  completeOnboarding,
};
