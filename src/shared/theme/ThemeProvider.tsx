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
});

const DARK_VARS = vars({
  '--ink': '236 232 245',
  '--ink-soft': '214 207 230',
  '--ink-muted': '168 158 191',
  '--ink-faint': '132 122 154',
  '--cream': '22 16 38',
  '--cream-bezel1': '34 25 52',
  '--cream-bezel2': '46 36 64',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useThemeStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const { colorScheme } = useColorScheme();
  return <View style={[{ flex: 1 }, colorScheme === 'dark' ? DARK_VARS : LIGHT_VARS]}>{children}</View>;
}
