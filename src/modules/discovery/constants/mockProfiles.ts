export interface MockProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  country: string;
  distanceKm: number;
  matchPercent: number;
  verified: boolean;
  tags: string[];
  bio: string;
  photoSeed: number;
}

/**
 * Static demo dataset — no Supabase queries yet, this only exists to make
 * the discovery UI interactive/complete during the UI-implementation phase.
 */
export const MOCK_PROFILES: MockProfile[] = [
  {
    id: '1',
    name: 'Amira',
    age: 26,
    city: 'Lagos',
    country: 'Nigeria',
    distanceKm: 8,
    matchPercent: 94,
    verified: true,
    tags: ['Musique', 'Voyage', 'Lecture'],
    bio: "Passionnée de musique afrobeat et grande voyageuse. À la recherche d'une connexion sincère.",
    photoSeed: 1,
  },
  {
    id: '2',
    name: 'Kofi',
    age: 29,
    city: 'Accra',
    country: 'Ghana',
    distanceKm: 14,
    matchPercent: 88,
    verified: true,
    tags: ['Sport', 'Cuisine', 'Spiritualité'],
    bio: "Entrepreneur, amateur de bonne cuisine et de football le dimanche.",
    photoSeed: 2,
  },
  {
    id: '3',
    name: 'Fatou',
    age: 24,
    city: 'Dakar',
    country: 'Sénégal',
    distanceKm: 22,
    matchPercent: 91,
    verified: false,
    tags: ['Art', 'Mode', 'Culture'],
    bio: 'Artiste dans l\'âme, passionnée de mode et de culture africaine contemporaine.',
    photoSeed: 3,
  },
  {
    id: '4',
    name: 'Nadia',
    age: 27,
    city: 'Abidjan',
    country: "Côte d'Ivoire",
    distanceKm: 5,
    matchPercent: 96,
    verified: true,
    tags: ['Yoga', 'Famille', 'Cinéma'],
    bio: 'Professeure de yoga, très attachée à la famille et aux valeurs traditionnelles.',
    photoSeed: 4,
  },
  {
    id: '5',
    name: 'David',
    age: 31,
    city: 'Nairobi',
    country: 'Kenya',
    distanceKm: 18,
    matchPercent: 85,
    verified: false,
    tags: ['Danse', 'Voyage', 'Musique'],
    bio: 'Ingénieur le jour, danseur le soir. Toujours prêt pour une nouvelle aventure.',
    photoSeed: 5,
  },
];
