import { create } from 'zustand';

interface FiltersState {
  distanceKm: number;
  ageMin: number;
  ageMax: number;
  verifiedOnly: boolean;
  /** Centres d'intérêt sélectionnés (ids de la table interests). */
  interestIds: string[];
  setDistanceKm: (value: number) => void;
  setAgeRange: (min: number, max: number) => void;
  toggleVerifiedOnly: () => void;
  toggleInterest: (id: string) => void;
  reset: () => void;
}

const DEFAULT_FILTERS = {
  distanceKm: 25,
  ageMin: 22,
  ageMax: 38,
  verifiedOnly: false,
  interestIds: [] as string[],
};

export const useFiltersStore = create<FiltersState>((set) => ({
  ...DEFAULT_FILTERS,
  setDistanceKm: (distanceKm) => set({ distanceKm }),
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
