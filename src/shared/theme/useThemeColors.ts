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
const INK_DARK = { DEFAULT: '#F2EEFA', soft: '#DBD4EC', muted: '#B0A5C8', faint: '#8A7FA2' } as const;
const CREAM_DARK = { DEFAULT: '#171022', bezel1: '#241B36', bezel2: '#32274A' } as const;

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
