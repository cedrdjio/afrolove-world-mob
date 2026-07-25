import { useEffect } from 'react';
import { View } from 'react-native';
import { vars, useColorScheme } from 'nativewind';
import { useThemeStore } from './themeStore';

/**
 * Bascule les *tokens de couleur* (ink = texte, cream = surfaces claires)
 * selon le thème actif, via des variables CSS NativeWind. Les classes
 * existantes (`text-ink`, `bg-cream`, `text-ink-muted`…) pointent sur ces
 * variables (voir tailwind.config.js), donc tout l'app suit sans réécrire
 * chaque écran. Le mode clair garde EXACTEMENT les valeurs d'origine — aucune
 * régression visuelle. Seul le mode sombre introduit de nouvelles valeurs.
 */
const LIGHT_VARS = vars({
  '--ink': '46 36 64',
  '--ink-soft': '61 53 82',
  '--ink-muted': '94 84 115',
  '--ink-faint': '138 127 160',
  '--cream': '250 248 253',
  '--cream-bezel1': '237 228 249',
  '--cream-bezel2': '217 201 241',
  '--surface': '255 255 255',
  '--surface-border': '255 255 255',
});

// Palette sombre « référence » : fond quasi noir, cartes charbon solides,
// texte clair à fort contraste — pas de voile blanc délavé.
const DARK_VARS = vars({
  '--ink': '240 237 247',
  '--ink-soft': '216 210 232',
  '--ink-muted': '172 163 194',
  '--ink-faint': '134 124 156',
  '--cream': '18 14 26',
  '--cream-bezel1': '30 24 44',
  '--cream-bezel2': '42 34 60',
  '--surface': '44 37 62',
  '--surface-border': '70 62 96',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useThemeStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const { colorScheme } = useColorScheme();
  return <View style={[{ flex: 1 }, colorScheme === 'dark' ? DARK_VARS : LIGHT_VARS]}>{children}</View>;
}
