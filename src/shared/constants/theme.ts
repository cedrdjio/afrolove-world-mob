/**
 * AfriLove World — design tokens
 * Extracted from the source design (AfriLove App Screens.dc.html).
 * Warm terracotta / gold palette, glassmorphism surfaces, dual light+dark themes.
 */

export const colors = {
  brand: {
    light: '#D4774A',
    DEFAULT: '#C86040',
    dark: '#9A3C1C',
  },
  gold: {
    light: '#E0A94A',
    DEFAULT: '#C9862A',
    dark: '#8A5010',
  },
  ink: {
    DEFAULT: '#1A0804',
    soft: '#2C1408',
    muted: '#7A5540',
    faint: '#9A7060',
  },
  cream: {
    DEFAULT: '#FDF5EE',
    bezel1: '#E8DDD4',
    bezel2: '#D4C4B0',
  },
  deep: {
    DEFAULT: '#0D0502',
    soft: '#2A1A10',
    ember: '#6B2810',
    black: '#070201',
  },
  success: '#4CAF50',
  danger: '#B41E14',
  white: '#FFFFFF',
} as const;

export const gradients = {
  brand: [colors.brand.light, colors.brand.dark] as const, // 135deg
  brandVertical: [colors.brand.light, colors.brand.dark] as const,
  bezelLight: [colors.cream.bezel1, colors.cream.bezel2] as const, // 145deg
  bezelDark: [colors.deep.soft, colors.deep.DEFAULT] as const, // 145deg
  splashBg: ['#6B2810', '#2A1008', '#070201'] as const, // radial approximation, use as linear fallback
  gold: [colors.gold.DEFAULT, colors.gold.dark] as const,
};

export const glass = {
  light: {
    background: 'rgba(255,255,255,0.72)',
    backgroundStrong: 'rgba(255,255,255,0.82)',
    backgroundSoft: 'rgba(255,255,255,0.62)',
    border: 'rgba(255,255,255,0.9)',
  },
  dark: {
    background: 'rgba(255,255,255,0.14)',
    backgroundStrong: 'rgba(255,255,255,0.18)',
    border: 'rgba(255,255,255,0.24)',
  },
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 24,
  pill: 999,
};

export const spacing = {
  screenX: 22,
  screenXLg: 26,
};

export const shadows = {
  brand: {
    shadowColor: colors.brand.dark,
    shadowOpacity: 0.32,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  soft: {
    shadowColor: colors.ink.soft,
    shadowOpacity: 0.09,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  card: {
    shadowColor: '#2C1408',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};

export const fontFamilies = {
  displayBlack: 'BarlowCondensed-ExtraBold',
  display: 'BarlowCondensed-Bold',
  displaySemibold: 'BarlowCondensed-SemiBold',
  displayMedium: 'BarlowCondensed-Medium',
  heading: 'Barlow-Bold',
  headingSemibold: 'Barlow-SemiBold',
  headingMedium: 'Barlow-Medium',
  body: 'Montserrat-Regular',
  bodyMedium: 'Montserrat-Medium',
  bodySemibold: 'Montserrat-SemiBold',
} as const;

export const fontMap = {
  'BarlowCondensed-ExtraBold': require('@expo-google-fonts/barlow-condensed').BarlowCondensed_800ExtraBold,
  'BarlowCondensed-Bold': require('@expo-google-fonts/barlow-condensed').BarlowCondensed_700Bold,
  'BarlowCondensed-SemiBold': require('@expo-google-fonts/barlow-condensed').BarlowCondensed_600SemiBold,
  'BarlowCondensed-Medium': require('@expo-google-fonts/barlow-condensed').BarlowCondensed_500Medium,
  'Barlow-Bold': require('@expo-google-fonts/barlow').Barlow_700Bold,
  'Barlow-SemiBold': require('@expo-google-fonts/barlow').Barlow_600SemiBold,
  'Barlow-Medium': require('@expo-google-fonts/barlow').Barlow_500Medium,
  'Montserrat-Regular': require('@expo-google-fonts/montserrat').Montserrat_400Regular,
  'Montserrat-Medium': require('@expo-google-fonts/montserrat').Montserrat_500Medium,
  'Montserrat-SemiBold': require('@expo-google-fonts/montserrat').Montserrat_600SemiBold,
};

export type ThemeColors = typeof colors;
