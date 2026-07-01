import {
  useInterestsQuery,
  useLanguagesQuery,
  useReligionsQuery,
  useEducationLevelsQuery,
} from '@/modules/profile/hooks/useReferenceData';
import { LIFESTYLE_CATEGORIES } from '@/shared/constants/lifestyle';
import { calculateAge, type Profile } from '@/modules/profile/types/profile';

export interface ProfileDisplayData {
  age: number | null;
  interestLabels: string[];
  languageLabels: string[];
  religionLabel: string | null;
  educationLabel: string | null;
  lifestyleRows: { label: string; value: string }[];
}

/** Resolves a raw `Profile` (ids + enum values) into ready-to-render French
 *  labels by cross-referencing the cached reference catalogs — shared by
 *  the "view another user's profile" and "preview my own profile" screens
 *  so the two never drift apart. */
export function useProfileDisplayData(profile: Profile | undefined): ProfileDisplayData | null {
  const interestsQuery = useInterestsQuery();
  const languagesQuery = useLanguagesQuery();
  const religionsQuery = useReligionsQuery();
  const educationQuery = useEducationLevelsQuery();

  if (!profile) return null;

  const interestLabels = profile.interestIds
    .map((id) => interestsQuery.data?.find((i) => i.id === id)?.label)
    .filter((label): label is string => Boolean(label));

  const languageLabels = profile.languageIds
    .map((id) => languagesQuery.data?.find((l) => l.id === id)?.label)
    .filter((label): label is string => Boolean(label));

  const religionLabel = religionsQuery.data?.find((r) => r.id === profile.religionId)?.label ?? null;
  const educationLabel = educationQuery.data?.find((e) => e.id === profile.educationLevelId)?.label ?? null;

  const lifestyleRows = LIFESTYLE_CATEGORIES.map((category) => ({
    label: category.label,
    value: category.options.find((option) => option.value === profile[category.key])?.label ?? '—',
  }));

  return {
    age: profile.birthDate ? calculateAge(profile.birthDate) : null,
    interestLabels,
    languageLabels,
    religionLabel,
    educationLabel,
    lifestyleRows,
  };
}
