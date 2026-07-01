import { create } from 'zustand';

interface FiltersState {
  distanceKm: number;
  ageMin: number;
  ageMax: number;
  verifiedOnly: boolean;
  setDistanceKm: (value: number) => void;
  setAgeRange: (min: number, max: number) => void;
  toggleVerifiedOnly: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  distanceKm: 25,
  ageMin: 22,
  ageMax: 38,
  verifiedOnly: false,
  setDistanceKm: (distanceKm) => set({ distanceKm }),
  setAgeRange: (ageMin, ageMax) => set({ ageMin, ageMax }),
  toggleVerifiedOnly: () => set((state) => ({ verifiedOnly: !state.verifiedOnly })),
}));
