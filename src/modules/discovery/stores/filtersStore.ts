import { create } from 'zustand';
import type { DiscoveryScope } from '@/modules/discovery/types/discovery';

interface FiltersState {
  /** Périmètre des rencontres — 'international' (diaspora) par défaut. */
  scope: DiscoveryScope;
  /** Pays ciblé quand scope = 'country'. */
  country: string | null;
  ageMin: number;
  ageMax: number;
  verifiedOnly: boolean;
  /** Centres d'intérêt sélectionnés (ids de la table interests). */
  interestIds: string[];
  setScope: (scope: DiscoveryScope) => void;
  setCountry: (country: string | null) => void;
  setAgeRange: (min: number, max: number) => void;
  toggleVerifiedOnly: () => void;
  toggleInterest: (id: string) => void;
  reset: () => void;
}

const DEFAULT_FILTERS = {
  scope: 'international' as DiscoveryScope,
  country: null as string | null,
  ageMin: 22,
  ageMax: 38,
  verifiedOnly: false,
  interestIds: [] as string[],
};

export const useFiltersStore = create<FiltersState>((set) => ({
  ...DEFAULT_FILTERS,
  // Choisir un pays précis bascule automatiquement le périmètre dessus ;
  // revenir sur un autre périmètre oublie le pays pour éviter un état ambigu.
  setScope: (scope) => set((state) => ({ scope, country: scope === 'country' ? state.country : null })),
  setCountry: (country) => set({ country, scope: country ? 'country' : 'international' }),
  setAgeRange: (ageMin, ageMax) => set({ ageMin, ageMax }),
  toggleVerifiedOnly: () => set((state) => ({ verifiedOnly: !state.verifiedOnly })),
  toggleInterest: (id) =>
    set((state) => ({
      interestIds: state.interestIds.includes(id)
        ? state.interestIds.filter((i) => i !== id)
        : [...state.interestIds, id],
    })),
  reset: () => set(DEFAULT_FILTERS),
}));
