export type Smoking = 'non_smoker' | 'occasional' | 'smoker';
export type Drinking = 'never' | 'socially' | 'regularly';
export type GymHabit = 'never' | 'occasional' | 'regular';
export type HasPets = 'love' | 'neutral' | 'not_fan';
export type WantsChildren = 'not_wanted' | 'has_children' | 'wants';

export interface ReferenceOption {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
}

export interface InterestOption extends ReferenceOption {
  icon: string | null;
}

export interface RelationshipGoalOption extends ReferenceOption {
  subtitle: string | null;
}

export interface ProfilePhoto {
  id: string;
  url: string;
  position: number;
  isPrimary: boolean;
}

export interface Profile {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  lookingFor: string | null;
  birthDate: string | null;
  bio: string | null;
  heightCm: number | null;
  profession: string | null;
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  avatarUrl: string | null;
  educationLevelId: string | null;
  religionId: string | null;
  relationshipGoalId: string | null;
  smoking: Smoking | null;
  drinking: Drinking | null;
  gymHabit: GymHabit | null;
  hasPets: HasPets | null;
  wantsChildren: WantsChildren | null;
  onboardingCompleted: boolean;
  profileCompleted: boolean;
  photos: ProfilePhoto[];
  interestIds: string[];
  languageIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileCompletionStatus {
  isComplete: boolean;
  missing: {
    bio: boolean;
    interests: boolean;
    photos: boolean;
    lifestyle: boolean;
    gender: boolean;
    lookingFor: boolean;
    birthDate: boolean;
  };
}

export const MIN_INTERESTS = 3;
export const MIN_PHOTOS = 2;
export const MAX_PHOTOS = 6;

export function computeProfileCompletion(profile: Profile): ProfileCompletionStatus {
  const missing = {
    bio: !profile.bio || profile.bio.trim().length === 0,
    interests: profile.interestIds.length < MIN_INTERESTS,
    photos: profile.photos.length < MIN_PHOTOS,
    lifestyle: !profile.smoking || !profile.drinking || !profile.gymHabit || !profile.hasPets || !profile.wantsChildren,
    gender: !profile.gender,
    lookingFor: !profile.lookingFor,
    birthDate: !profile.birthDate,
  };

  return {
    isComplete: !Object.values(missing).some(Boolean),
    missing,
  };
}

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}
