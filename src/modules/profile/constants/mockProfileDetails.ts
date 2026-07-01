import { MOCK_PROFILES } from '@/modules/discovery/constants/mockProfiles';

export interface ProfileDetail {
  religion: string;
  education: string;
  profession: string;
  languages: string[];
  lifestyle: { label: string; value: string }[];
  heightCm: number;
  mutualInterests: string[];
  photoCount: number;
}

const DETAILS: Record<string, ProfileDetail> = {
  '1': {
    religion: 'Chrétienne',
    education: 'Master en Commerce International',
    profession: 'Chef de projet marketing',
    languages: ['Français', 'Anglais', 'Yoruba'],
    lifestyle: [
      { label: 'Tabac', value: 'Non-fumeuse' },
      { label: 'Alcool', value: 'Socialement' },
      { label: 'Sport', value: 'Régulier' },
      { label: 'Enfants', value: 'En veut' },
    ],
    heightCm: 168,
    mutualInterests: ['Musique', 'Voyage'],
    photoCount: 4,
  },
  '2': {
    religion: 'Musulman',
    education: 'Licence en Ingénierie',
    profession: 'Entrepreneur',
    languages: ['Français', 'Anglais', 'Twi'],
    lifestyle: [
      { label: 'Tabac', value: 'Non-fumeur' },
      { label: 'Alcool', value: 'Jamais' },
      { label: 'Sport', value: 'Régulier' },
      { label: 'Enfants', value: 'En a déjà' },
    ],
    heightCm: 181,
    mutualInterests: ['Sport', 'Cuisine'],
    photoCount: 3,
  },
};

const DEFAULT_DETAIL: ProfileDetail = {
  religion: 'Non précisé',
  education: 'Non précisé',
  profession: 'Non précisé',
  languages: ['Français', 'Anglais'],
  lifestyle: [
    { label: 'Tabac', value: 'Non-fumeur' },
    { label: 'Alcool', value: 'Socialement' },
    { label: 'Sport', value: 'Occasionnel' },
    { label: 'Enfants', value: "N'en veut pas" },
  ],
  heightCm: 172,
  mutualInterests: [],
  photoCount: 2,
};

export function getProfileById(id: string) {
  const profile = MOCK_PROFILES.find((p) => p.id === id) ?? MOCK_PROFILES[0];
  const detail = DETAILS[id] ?? DEFAULT_DETAIL;
  return { ...profile, ...detail };
}
