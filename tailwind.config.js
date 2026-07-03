/** @type {import('tailwindcss').Config} */
// AfriLove World — charte lavande v1.0. Token names are semantic and stable:
// screens use brand/gold/ink/cream/deep; a rebrand only swaps values here.
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand — violet profond (actions, liens, CTA)
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
        // Ink — aubergine, texte sur fonds clairs
        ink: {
          DEFAULT: '#2E2440',
          soft: '#3D3552',
          muted: '#5E5473',
          faint: '#8A7FA0',
        },
        // Cream — blanc lavande / brume, surfaces claires
        cream: {
          DEFAULT: '#FAF8FD',
          bezel1: '#EDE4F9',
          bezel2: '#D9C9F1',
        },
        // Deep — nuit aubergine (splash, héros, match, premium)
        deep: {
          DEFAULT: '#221937',
          soft: '#3A2B4F',
          ember: '#4A2C7F',
          black: '#180F2A',
        },
        success: '#3E9B5F',
        danger: '#C24545',
      },
      fontFamily: {
        display: ['PlusJakartaSans-Bold'],
        'display-black': ['PlusJakartaSans-ExtraBold'],
        'display-semibold': ['PlusJakartaSans-SemiBold'],
        heading: ['PlusJakartaSans-Bold'],
        'heading-semibold': ['PlusJakartaSans-SemiBold'],
        'heading-medium': ['PlusJakartaSans-Medium'],
        body: ['Nunito-Regular'],
        'body-medium': ['Nunito-Medium'],
        'body-semibold': ['Nunito-SemiBold'],
      },
    },
  },
  plugins: [],
};
