import { cloneElement, isValidElement, type ReactNode } from 'react';
import { colors } from '@/shared/constants/theme';
import { useThemeColors } from './useThemeColors';

/**
 * Beaucoup d'écrans passent aux icônes lucide des couleurs « encre » figées
 * (colors.ink.*) pensées pour le fond clair — invisibles sur les cartes
 * charbon du mode sombre (boutons retour, steppers, icônes de champs…).
 *
 * Ce hook renvoie une fonction qui, en mode sombre uniquement, remplace ces
 * couleurs statiques connues par leur équivalent clair du thème. Les
 * composants conteneurs partagés (IconButton, GlassInput) l'appliquent à
 * leurs enfants : tous les appels existants sont corrigés sans les réécrire.
 */
const STATIC_INK_TO_TOKEN: Record<string, 'DEFAULT' | 'soft' | 'muted' | 'faint'> = {
  [colors.ink.DEFAULT]: 'DEFAULT',
  [colors.ink.soft]: 'soft',
  [colors.ink.muted]: 'muted',
  [colors.ink.faint]: 'faint',
};

export function useThemedStaticIcon() {
  const c = useThemeColors();
  return (node: ReactNode): ReactNode => {
    if (!c.isDark || !isValidElement(node)) return node;
    const color = (node.props as { color?: unknown }).color;
    if (typeof color !== 'string') return node;
    const token = STATIC_INK_TO_TOKEN[color];
    if (!token) return node;
    return cloneElement(node as React.ReactElement<{ color: string }>, { color: c.ink[token] });
  };
}
