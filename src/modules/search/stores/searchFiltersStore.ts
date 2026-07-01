import { create } from 'zustand';

interface SearchFiltersState {
  distanceKm: number;
  ageMin: number;
  ageMax: number;
  country: string;
  city: string;
  religion: string;
  languages: string[];
  lifestyle: string[];
  education: string;
  profession: string;
  heightMin: number;
  heightMax: number;
  verifiedOnly: boolean;
  setDistanceKm: (value: number) => void;
  setAgeRange: (min: number, max: number) => void;
  setCountry: (value: string) => void;
  setCity: (value: string) => void;
  setReligion: (value: string) => void;
  toggleLanguage: (value: string) => void;
  toggleLifestyle: (value: string) => void;
  setEducation: (value: string) => void;
  setProfession: (value: string) => void;
  setHeightRange: (min: number, max: number) => void;
  toggleVerifiedOnly: () => void;
}

export const useSearchFiltersStore = create<SearchFiltersState>((set) => ({
  distanceKm: 25,
  ageMin: 22,
  ageMax: 38,
  country: 'Tous les pays',
  city: 'Toutes les villes',
  religion: 'Peu importe',
  languages: [],
  lifestyle: [],
  education: 'Peu importe',
  profession: '',
  heightMin: 150,
  heightMax: 200,
  verifiedOnly: false,
  setDistanceKm: (distanceKm) => set({ distanceKm }),
  setAgeRange: (ageMin, ageMax) => set({ ageMin, ageMax }),
  setCountry: (country) => set({ country }),
  setCity: (city) => set({ city }),
  setReligion: (religion) => set({ religion }),
  toggleLanguage: (value) =>
    set((state) => ({
      languages: state.languages.includes(value)
        ? state.languages.filter((v) => v !== value)
        : [...state.languages, value],
    })),
  toggleLifestyle: (value) =>
    set((state) => ({
      lifestyle: state.lifestyle.includes(value)
        ? state.lifestyle.filter((v) => v !== value)
        : [...state.lifestyle, value],
    })),
  setEducation: (education) => set({ education }),
  setProfession: (profession) => set({ profession }),
  setHeightRange: (heightMin, heightMax) => set({ heightMin, heightMax }),
  toggleVerifiedOnly: () => set((state) => ({ verifiedOnly: !state.verifiedOnly })),
}));
