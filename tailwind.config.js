/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand — warm terracotta/brown (primary CTA gradient endpoints)
        brand: {
          light: '#D4774A',
          DEFAULT: '#C86040',
          dark: '#9A3C1C',
        },
        // Accent gold (verified badges, premium)
        gold: {
          light: '#E0A94A',
          DEFAULT: '#C9862A',
          dark: '#8A5010',
        },
        // Ink — text on light backgrounds
        ink: {
          DEFAULT: '#1A0804',
          soft: '#2C1408',
          muted: '#7A5540',
          faint: '#9A7060',
        },
        // Cream — light theme surface
        cream: {
          DEFAULT: '#FDF5EE',
          bezel1: '#E8DDD4',
          bezel2: '#D4C4B0',
        },
        // Deep — dark theme surface (splash, profile hero, match, premium)
        deep: {
          DEFAULT: '#0D0502',
          soft: '#2A1A10',
          ember: '#6B2810',
          black: '#070201',
        },
        success: '#4CAF50',
        danger: '#B41E14',
      },
      fontFamily: {
        display: ['BarlowCondensed-Bold'],
        'display-black': ['BarlowCondensed-ExtraBold'],
        'display-semibold': ['BarlowCondensed-SemiBold'],
        heading: ['Barlow-Bold'],
        'heading-semibold': ['Barlow-SemiBold'],
        'heading-medium': ['Barlow-Medium'],
        body: ['Montserrat-Regular'],
        'body-medium': ['Montserrat-Medium'],
        'body-semibold': ['Montserrat-SemiBold'],
      },
    },
  },
  plugins: [],
};
