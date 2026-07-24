import { useColorScheme } from 'nativewind';
import { colors } from '@/shared/constants/theme';

/**
 * Version « JS » des tokens de couleur, sensible au thème — pour les endroits
 * qui reçoivent une couleur en prop (icônes lucide, dégradés, GlassSurface)
 * et ne peuvent donc pas passer par une classe Tailwind.
 *
 * Seuls `ink` (texte) et `cream` (surfaces claires) basculent : brand, gold,
 * success, danger et deep fonctionnent déjà sur les deux fonds.
 */
const INK_DARK = { DEFAULT: '#ECE8F5', soft: '#D6CFE6', muted: '#A89EBF', faint: '#847A9A' } as const;
const CREAM_DARK = { DEFAULT: '#161026', bezel1: '#221934', bezel2: '#2E2440' } as const;

export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  return {
    ...colors,
    ink: dark ? INK_DARK : colors.ink,
    cream: dark ? CREAM_DARK : colors.cream,
    isDark: dark,
  };
}
