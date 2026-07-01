import type { LucideIcon } from 'lucide-react-native';
import {
  Music,
  PartyPopper,
  Plane,
  UtensilsCrossed,
  Palette,
  BookOpen,
  Sparkles,
  Shirt,
  Dumbbell,
  Users,
  HeartHandshake,
  Globe,
  Clapperboard,
} from 'lucide-react-native';

export interface InterestOption {
  key: string;
  label: string;
  Icon: LucideIcon;
}

export const INTERESTS: InterestOption[] = [
  { key: 'musique', label: 'Musique', Icon: Music },
  { key: 'danse', label: 'Danse', Icon: PartyPopper },
  { key: 'voyage', label: 'Voyage', Icon: Plane },
  { key: 'cuisine', label: 'Cuisine', Icon: UtensilsCrossed },
  { key: 'art', label: 'Art', Icon: Palette },
  { key: 'lecture', label: 'Lecture', Icon: BookOpen },
  { key: 'yoga', label: 'Yoga', Icon: Sparkles },
  { key: 'mode', label: 'Mode', Icon: Shirt },
  { key: 'sport', label: 'Sport', Icon: Dumbbell },
  { key: 'famille', label: 'Famille', Icon: Users },
  { key: 'spiritualite', label: 'Spiritualité', Icon: HeartHandshake },
  { key: 'culture', label: 'Culture', Icon: Globe },
  { key: 'cinema', label: 'Cinéma', Icon: Clapperboard },
];
