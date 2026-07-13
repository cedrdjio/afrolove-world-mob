import { create } from 'zustand';
import type { LifestyleValues } from '@/shared/constants/lifestyle';
import { EMPTY_LIFESTYLE } from '@/shared/constants/lifestyle';

export type Gender = 'femme' | 'homme' | 'non-binaire';
export type LookingForOption = 'femmes' | 'hommes' | 'les-deux';

interface OnboardingState {
  /** Prénom réel — sert aussi à la vérification d'identité (KYC). */
  firstName: string;
  /** Nom de famille réel — requis pour vérifier l'identité du membre. */
  lastName: string;
  gender: Gender | null;
  birthDate: { day: string; month: string; year: string };
  lookingFor: LookingForOption | null;
  bio: string;
  interestIds: string[];
  lifestyle: LifestyleValues;
  photos: string[];
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setGender: (value: Gender) => void;
  setBirthDate: (value: Partial<OnboardingState['birthDate']>) => void;
  setLookingFor: (value: LookingForOption) => void;
  setBio: (value: string) => void;
  toggleInterest: (id: string) => void;
  setLifestyleChoice: <K extends keyof LifestyleValues>(key: K, value: LifestyleValues[K]) => void;
  setPhotos: (value: string[]) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  firstName: '',
  lastName: '',
  gender: null,
  birthDate: { day: '', month: '', year: '' },
  lookingFor: null,
  bio: '',
  interestIds: [],
  lifestyle: EMPTY_LIFESTYLE,
  photos: [],
  setFirstName: (firstName) => set({ firstName }),
  setLastName: (lastName) => set({ lastName }),
  setGender: (gender) => set({ gender }),
  setBirthDate: (value) => set((state) => ({ birthDate: { ...state.birthDate, ...value } })),
  setLookingFor: (lookingFor) => set({ lookingFor }),
  setBio: (bio) => set({ bio }),
  toggleInterest: (id) =>
    set((state) => ({
      interestIds: state.interestIds.includes(id)
        ? state.interestIds.filter((i) => i !== id)
        : [...state.interestIds, id],
    })),
  setLifestyleChoice: (key, value) => set((state) => ({ lifestyle: { ...state.lifestyle, [key]: value } })),
  setPhotos: (photos) => set({ photos }),
}));
