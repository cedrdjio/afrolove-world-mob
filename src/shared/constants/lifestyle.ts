import type { LucideIcon } from 'lucide-react-native';
import { Cigarette, Wine, Dumbbell, Baby, PawPrint } from 'lucide-react-native';

export interface LifestyleCategory {
  key: string;
  label: string;
  Icon: LucideIcon;
  options: string[];
}

export const LIFESTYLE_CATEGORIES: LifestyleCategory[] = [
  { key: 'tabac', label: 'Tabac', Icon: Cigarette, options: ['Non-fumeur', 'Occasionnel', 'Fumeur'] },
  { key: 'alcool', label: 'Alcool', Icon: Wine, options: ['Jamais', 'Socialement', 'Régulièrement'] },
  { key: 'sport', label: 'Sport', Icon: Dumbbell, options: ['Jamais', 'Occasionnel', 'Régulier'] },
  { key: 'enfants', label: 'Enfants', Icon: Baby, options: ["N'en veut pas", 'En a déjà', 'En veut'] },
  { key: 'animaux', label: 'Animaux', Icon: PawPrint, options: ['Adore', 'Neutre', 'Pas fan'] },
];
