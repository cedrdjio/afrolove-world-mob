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

// Palette sombre « nuit lavande » : fond aubergine profond, cartes charbon
// violacé solides, texte clair à fort contraste — la charte lavande reste
// présente dans chaque teinte, sans voile blanc délavé.
const DARK_VARS = vars({
  '--ink': '242 238 250',
  '--ink-soft': '219 212 236',
  '--ink-muted': '176 165 200',
  '--ink-faint': '138 127 162',
  '--cream': '23 16 34',
  '--cream-bezel1': '36 27 54',
  '--cream-bezel2': '50 39 74',
  '--surface': '50 41 74',
  '--surface-border': '88 74 124',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useThemeStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const { colorScheme } = useColorScheme();
  return <View style={[{ flex: 1 }, colorScheme === 'dark' ? DARK_VARS : LIGHT_VARS]}>{children}</View>;
}
