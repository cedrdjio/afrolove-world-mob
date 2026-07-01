import { create } from 'zustand';

export type Gender = 'femme' | 'homme' | 'non-binaire';
export type LookingForOption = 'femmes' | 'hommes' | 'les-deux';

interface OnboardingState {
  firstName: string;
  gender: Gender | null;
  birthDate: { day: string; month: string; year: string };
  lookingFor: LookingForOption | null;
  interests: string[];
  lifestyle: Record<string, string>;
  photos: string[];
  setFirstName: (value: string) => void;
  setGender: (value: Gender) => void;
  setBirthDate: (value: Partial<OnboardingState['birthDate']>) => void;
  setLookingFor: (value: LookingForOption) => void;
  toggleInterest: (value: string) => void;
  setLifestyleChoice: (category: string, value: string) => void;
  setPhotos: (value: string[]) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  firstName: '',
  gender: null,
  birthDate: { day: '', month: '', year: '' },
  lookingFor: null,
  interests: [],
  lifestyle: {},
  photos: [],
  setFirstName: (firstName) => set({ firstName }),
  setGender: (gender) => set({ gender }),
  setBirthDate: (value) => set((state) => ({ birthDate: { ...state.birthDate, ...value } })),
  setLookingFor: (lookingFor) => set({ lookingFor }),
  toggleInterest: (value) =>
    set((state) => ({
      interests: state.interests.includes(value)
        ? state.interests.filter((i) => i !== value)
        : [...state.interests, value],
    })),
  setLifestyleChoice: (category, value) =>
    set((state) => ({ lifestyle: { ...state.lifestyle, [category]: value } })),
  setPhotos: (photos) => set({ photos }),
}));
