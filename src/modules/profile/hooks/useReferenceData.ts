import { useQuery } from '@tanstack/react-query';
import { referenceDataService } from '@/modules/profile/services/referenceDataService';
import { LIFESTYLE_CATEGORIES } from '@/shared/constants/lifestyle';
import type { LifestyleValues } from '@/shared/constants/lifestyle';

// Catalog content (interests, languages, ...) is admin-managed and changes
// rarely, so a long staleTime avoids refetching it on every screen visit.
const CATALOG_STALE_TIME = 30 * 60 * 1000;

export function useInterestsQuery() {
  return useQuery({
    queryKey: ['interests'],
    queryFn: referenceDataService.fetchInterests,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useLanguagesQuery() {
  return useQuery({
    queryKey: ['languages'],
    queryFn: referenceDataService.fetchLanguages,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useReligionsQuery() {
  return useQuery({
    queryKey: ['religions'],
    queryFn: referenceDataService.fetchReligions,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useEducationLevelsQuery() {
  return useQuery({
    queryKey: ['education-levels'],
    queryFn: referenceDataService.fetchEducationLevels,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useRelationshipGoalsQuery() {
  return useQuery({
    queryKey: ['relationship-goals'],
    queryFn: referenceDataService.fetchRelationshipGoals,
    staleTime: CATALOG_STALE_TIME,
  });
}

/** Catégorie BD (lifestyle_options.category) → champ du profil. */
const LIFESTYLE_DB_CATEGORY_TO_KEY: Record<string, keyof LifestyleValues> = {
  smoking: 'smoking',
  drinking: 'drinking',
  gym: 'gymHabit',
  pets: 'hasPets',
  children: 'wantsChildren',
};

export type LifestyleCategoryView = {
  key: keyof LifestyleValues;
  label: string;
  Icon: (typeof LIFESTYLE_CATEGORIES)[number]['Icon'];
  options: { value: string; label: string }[];
};

/**
 * Les libellés de style de vie viennent de la table `lifestyle_options`
 * (modifiable depuis le dashboard) ; icônes et intitulés de section restent
 * locaux. Tant que le catalogue n'est pas chargé — ou s'il est vide — les
 * constantes historiques servent de secours pour ne jamais bloquer
 * l'onboarding hors-ligne.
 */
export function useLifestyleCategories(): { categories: LifestyleCategoryView[]; isLoading: boolean } {
  const query = useQuery({
    queryKey: ['lifestyle-options'],
    queryFn: referenceDataService.fetchLifestyleOptions,
    staleTime: CATALOG_STALE_TIME,
  });

  const categories: LifestyleCategoryView[] = LIFESTYLE_CATEGORIES.map((fallback) => {
    const dbCategory = Object.entries(LIFESTYLE_DB_CATEGORY_TO_KEY).find(([, key]) => key === fallback.key)?.[0];
    const dbOptions = (query.data ?? [])
      .filter((option) => option.category === dbCategory)
      .map((option) => ({ value: option.value, label: option.label }));
    return {
      key: fallback.key,
      label: fallback.label,
      Icon: fallback.Icon,
      options: dbOptions.length > 0 ? dbOptions : fallback.options.map((o) => ({ value: o.value, label: o.label })),
    };
  });

  return { categories, isLoading: query.isLoading };
}
