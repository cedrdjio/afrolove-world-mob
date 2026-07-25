import { useThemeColors } from './useThemeColors';

/**
 * Couleur unique des placeholders de TOUS les champs de saisie — lisible dans
 * les deux thèmes. Les valeurs encre figées (rgba(46,36,64,…)) disparaissaient
 * complètement sur les champs du mode sombre.
 */
export function usePlaceholderColor(): string {
  const c = useThemeColors();
  return c.isDark ? 'rgba(242,238,250,0.4)' : 'rgba(46,36,64,0.28)';
}
