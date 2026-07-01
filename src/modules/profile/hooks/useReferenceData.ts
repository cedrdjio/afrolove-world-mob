import { useQuery } from '@tanstack/react-query';
import { referenceDataService } from '@/modules/profile/services/referenceDataService';

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
