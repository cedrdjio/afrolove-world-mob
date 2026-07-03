/**
 * AfriLove World — design tokens
 * Charte graphique v1.0 (juillet 2026) : gamme lavande ancrée par l'aubergine,
 * verre Fluent/glassmorphism, dégradé signature réservé aux actions.
 *
 * Token names are semantic and stable — screens reference `brand`, `ink`,
 * `cream`, `deep`, `gold` — so a rebrand swaps values here, never call sites.
 * (`gold` is the premium/accent slot, now the lavender accent range;
 * `cream` is the light surface slot, now blanc-lavande/brume.)
 */

export const colors = {
  brand: {
    light: '#8B69D6',
    DEFAULT: '#6A4FC0',
    dark: '#5B3E9E',
  },
  // Accent (badges vérifiés, premium) — lavande/lilas
  gold: {
    light: '#C3B1E1',
    DEFAULT: '#9B7EDE',
    dark: '#7C5CBF',
  },
  // Texte sur fonds clairs — aubergine
  ink: {
    DEFAULT: '#2E2440',
    soft: '#3D3552',
    muted: '#5E5473',
    faint: '#8A7FA0',
  },
  // Surfaces claires — blanc lavande / brume
  cream: {
    DEFAULT: '#FAF8FD',
    bezel1: '#EDE4F9',
    bezel2: '#D9C9F1',
  },
  // Surfaces sombres — nuit aubergine
  deep: {
    DEFAULT: '#221937',
    soft: '#3A2B4F',
    ember: '#4A2C7F',
    black: '#180F2A',
  },
  success: '#3E9B5F',
  danger: '#C24545',
  white: '#FFFFFF',
} as const;

export const gradients = {
  brand: ['#8B69D6', '#5B3E9E'] as const, // dégradé signature · 135°
  brandVertical: ['#8B69D6', '#5B3E9E'] as const,
  bezelLight: ['#F5F0FC', '#D9C9F1'] as const, // dégradé brume · 145°
  bezelDark: [colors.deep.soft, colors.deep.DEFAULT] as const,
  splashBg: ['#4A2C7F', '#2E2440', '#180F2A'] as const, // dégradé nuit
  gold: ['#A98FD8', '#7C5CBF'] as const, // accent lavande événementiel
};

export const glass = {
  light: {
    background: 'rgba(255,255,255,0.5)',
    backgroundStrong: 'rgba(255,255,255,0.66)',
    backgroundSoft: 'rgba(255,255,255,0.4)',
    border: 'rgba(255,255,255,0.75)',
  },
  dark: {
    background: 'rgba(255,255,255,0.1)',
    backgroundStrong: 'rgba(255,255,255,0.16)',
    border: 'rgba(255,255,255,0.22)',
  },
};

export const radii = {
  sm: 14,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
};

export const spacing = {
  screenX: 22,
  screenXLg: 26,
};

export const shadows = {
  brand: {
    shadowColor: '#5B3E9E',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  soft: {
    shadowColor: '#5B3E9E',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  card: {
    shadowColor: '#2E2440',
    shadowOpacity: 0.16,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};

export const fontFamilies = {
  displayBlack: 'PlusJakartaSans-ExtraBold',
  display: 'PlusJakartaSans-Bold',
  displaySemibold: 'PlusJakartaSans-SemiBold',
  displayMedium: 'PlusJakartaSans-Medium',
  heading: 'PlusJakartaSans-Bold',
  headingSemibold: 'PlusJakartaSans-SemiBold',
  headingMedium: 'PlusJakartaSans-Medium',
  body: 'Nunito-Regular',
  bodyMedium: 'Nunito-Medium',
  bodySemibold: 'Nunito-SemiBold',
} as const;

export const fontMap = {
  'PlusJakartaSans-ExtraBold': require('@expo-google-fonts/plus-jakarta-sans').PlusJakartaSans_800ExtraBold,
  'PlusJakartaSans-Bold': require('@expo-google-fonts/plus-jakarta-sans').PlusJakartaSans_700Bold,
  'PlusJakartaSans-SemiBold': require('@expo-google-fonts/plus-jakarta-sans').PlusJakartaSans_600SemiBold,
  'PlusJakartaSans-Medium': require('@expo-google-fonts/plus-jakarta-sans').PlusJakartaSans_500Medium,
  'Nunito-Regular': require('@expo-google-fonts/nunito').Nunito_400Regular,
  'Nunito-Medium': require('@expo-google-fonts/nunito').Nunito_500Medium,
  'Nunito-SemiBold': require('@expo-google-fonts/nunito').Nunito_600SemiBold,
};

export type ThemeColors = typeof colors;
