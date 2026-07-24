import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { colorScheme as nativewindColorScheme } from 'nativewind';

/**
 * Préférence de thème de l'utilisateur.
 *   · 'system' (défaut) — suit le mode clair/sombre du téléphone ;
 *   · 'light' / 'dark' — choix forcé, mémorisé entre les sessions.
 *
 * NativeWind gère le rendu : `colorScheme.set(pref)` applique le thème et,
 * pour 'system', suit automatiquement Appearance. La préférence est persistée
 * dans SecureStore et réappliquée au démarrage (voir hydrate()).
 */
export type ThemePref = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme_pref';

interface ThemeState {
  pref: ThemePref;
  setPref: (pref: ThemePref) => void;
  hydrate: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  pref: 'system',
  setPref: (pref) => {
    set({ pref });
    nativewindColorScheme.set(pref);
    SecureStore.setItemAsync(STORAGE_KEY, pref).catch(() => {});
  },
  hydrate: async () => {
    try {
      const saved = (await SecureStore.getItemAsync(STORAGE_KEY)) as ThemePref | null;
      const pref = saved ?? 'system';
      set({ pref });
      nativewindColorScheme.set(pref);
    } catch {
      nativewindColorScheme.set('system');
    }
  },
}));
