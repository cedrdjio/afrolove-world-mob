import { photoService } from '@/modules/profile/services/photoService';
import { profileService } from '@/modules/profile/services/profileService';
import { supabase } from '@/shared/services/supabase/client';
import type { LifestyleValues } from '@/shared/constants/lifestyle';
import type { Gender, LookingForOption } from '@/modules/onboarding/stores/onboardingStore';

export interface CompleteOnboardingInput {
  userId: string;
  firstName: string;
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

async function completeOnboarding(input: CompleteOnboardingInput): Promise<void> {
  // Storage's RLS check depends on the request actually carrying the
  // signed-in user's access token. Firing the photo uploads in parallel via
  // Promise.all let 3 storage requests race supabase-js's internal session
  // resolution at the exact same tick, occasionally sending one without a
  // valid Authorization header and tripping "new row violates row-level
  // security policy for table objects". Confirming a live session up front
  // and uploading one at a time removes the race entirely.
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    throw new Error('Session invalide : merci de vous reconnecter avant de terminer votre profil.');
  }

  for (const [index, uri] of input.photoUris.entries()) {
    await photoService.addPhoto(input.userId, uri, index);
  }
  await profileService.setInterests(input.userId, input.interestIds);

  await profileService.updateProfile(input.userId, {
    first_name: input.firstName,
    last_name: input.lastName,
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
}

export const onboardingService = {
  completeOnboarding,
};
