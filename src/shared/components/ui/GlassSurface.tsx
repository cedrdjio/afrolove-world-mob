import { View, StyleSheet, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'nativewind';
import { glass } from '@/shared/constants/theme';

type GlassVariant = 'light' | 'lightStrong' | 'lightSoft' | 'dark' | 'darkStrong';

// En mode sombre, les surfaces « claires » deviennent du verre sombre pour
// rester lisibles sur le fond nuit. Les variantes déjà sombres ne bougent pas.
const DARK_REMAP: Record<GlassVariant, GlassVariant> = {
  light: 'dark',
  lightStrong: 'darkStrong',
  lightSoft: 'dark',
  dark: 'dark',
  darkStrong: 'darkStrong',
};

// Surfaces du thème sombre : charbon aubergine quasi opaque + hairline
// discrète — des cartes solides façon maquette, pas un voile blanc.
const DARK_THEME_CONFIG: Record<'dark' | 'darkStrong', { background: string; border: string; intensity: number }> = {
  dark: { background: 'rgba(42,35,60,0.88)', border: 'rgba(255,255,255,0.07)', intensity: 10 },
  darkStrong: { background: 'rgba(52,44,74,0.94)', border: 'rgba(255,255,255,0.09)', intensity: 12 },
};

const VARIANT_CONFIG: Record<
  GlassVariant,
  { background: string; border: string; blurTint: 'light' | 'dark'; intensity: number }
> = {
  light: { background: glass.light.background, border: glass.light.border, blurTint: 'light', intensity: 40 },
  lightStrong: {
    background: glass.light.backgroundStrong,
    border: glass.light.border,
    blurTint: 'light',
    intensity: 60,
  },
  lightSoft: {
    background: glass.light.backgroundSoft,
    border: glass.light.border,
    blurTint: 'light',
    intensity: 30,
  },
  dark: { background: glass.dark.background, border: glass.dark.border, blurTint: 'dark', intensity: 30 },
  darkStrong: {
    background: glass.dark.backgroundStrong,
    border: glass.dark.border,
    blurTint: 'dark',
    intensity: 40,
  },
};

interface GlassSurfaceProps extends ViewProps {
  variant?: GlassVariant;
  radius?: number;
  borderWidth?: number;
  noBorder?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GlassSurface({
  variant = 'light',
  radius = 20,
  borderWidth = 1.5,
  noBorder = false,
  style,
  children,
  ...props
}: GlassSurfaceProps) {
  const { colorScheme } = useColorScheme();
  const isDarkTheme = colorScheme === 'dark';
  const resolved = isDarkTheme ? DARK_REMAP[variant] : variant;
  const config = isDarkTheme
    ? { ...VARIANT_CONFIG[resolved], ...DARK_THEME_CONFIG[resolved as 'dark' | 'darkStrong'] }
    : VARIANT_CONFIG[resolved];

  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]} {...props}>
      <BlurView intensity={config.intensity} tint={config.blurTint} style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: config.background,
            borderRadius: radius,
            borderWidth: noBorder ? 0 : borderWidth,
            borderColor: config.border,
          },
        ]}
      />
      {children}
    </View>
  );
}
