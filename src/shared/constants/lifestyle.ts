import type { LucideIcon } from 'lucide-react-native';
import { Cigarette, Wine, Dumbbell, Baby, PawPrint } from 'lucide-react-native';
import type { Drinking, GymHabit, HasPets, Smoking, WantsChildren } from '@/modules/profile/types/profile';

interface LifestyleOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface LifestyleCategory<TKey extends string, TValue extends string> {
  key: TKey;
  label: string;
  Icon: LucideIcon;
  options: LifestyleOption<TValue>[];
}

export const SMOKING_CATEGORY: LifestyleCategory<'smoking', Smoking> = {
  key: 'smoking',
  label: 'Tabac',
  Icon: Cigarette,
  options: [
    { value: 'non_smoker', label: 'Non-fumeur' },
    { value: 'occasional', label: 'Occasionnel' },
    { value: 'smoker', label: 'Fumeur' },
  ],
};

export const DRINKING_CATEGORY: LifestyleCategory<'drinking', Drinking> = {
  key: 'drinking',
  label: 'Alcool',
  Icon: Wine,
  options: [
    { value: 'never', label: 'Jamais' },
    { value: 'socially', label: 'Socialement' },
    { value: 'regularly', label: 'Régulièrement' },
  ],
};

export const GYM_HABIT_CATEGORY: LifestyleCategory<'gymHabit', GymHabit> = {
  key: 'gymHabit',
  label: 'Sport',
  Icon: Dumbbell,
  options: [
    { value: 'never', label: 'Jamais' },
    { value: 'occasional', label: 'Occasionnel' },
    { value: 'regular', label: 'Régulier' },
  ],
};

export const HAS_PETS_CATEGORY: LifestyleCategory<'hasPets', HasPets> = {
  key: 'hasPets',
  label: 'Animaux',
  Icon: PawPrint,
  options: [
    { value: 'love', label: 'Adore' },
    { value: 'neutral', label: 'Neutre' },
    { value: 'not_fan', label: 'Pas fan' },
  ],
};

export const WANTS_CHILDREN_CATEGORY: LifestyleCategory<'wantsChildren', WantsChildren> = {
  key: 'wantsChildren',
  label: 'Enfants',
  Icon: Baby,
  options: [
    { value: 'not_wanted', label: "N'en veut pas" },
    { value: 'has_children', label: 'En a déjà' },
    { value: 'wants', label: 'En veut' },
  ],
};

export const LIFESTYLE_CATEGORIES = [
  SMOKING_CATEGORY,
  DRINKING_CATEGORY,
  GYM_HABIT_CATEGORY,
  HAS_PETS_CATEGORY,
  WANTS_CHILDREN_CATEGORY,
] as const;

export interface LifestyleValues {
  smoking: Smoking | null;
  drinking: Drinking | null;
  gymHabit: GymHabit | null;
  hasPets: HasPets | null;
  wantsChildren: WantsChildren | null;
}

export const EMPTY_LIFESTYLE: LifestyleValues = {
  smoking: null,
  drinking: null,
  gymHabit: null,
  hasPets: null,
  wantsChildren: null,
};

export function isLifestyleComplete(lifestyle: LifestyleValues): boolean {
  return Boolean(
    lifestyle.smoking && lifestyle.drinking && lifestyle.gymHabit && lifestyle.hasPets && lifestyle.wantsChildren,
  );
}
