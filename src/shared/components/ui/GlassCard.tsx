import { View, StyleSheet, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassSurface } from './GlassSurface';
import { colors } from '@/shared/constants/theme';

interface GlassCardProps extends ViewProps {
  /** 'light' sur fonds clairs, 'dark' sur fonds nuit. */
  tone?: 'light' | 'dark';
  radius?: number;
  /** Padding interne (px). 0 pour composer soi-même. */
  padding?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Carte de verre Fluent — BlurView réel + reflet supérieur + ombre portée
 * douce. C'est la brique standard des cartes de contenu (remplace les
 * anciens fonds blancs plats bg-white/[0.55]).
 */
export function GlassCard({ tone = 'light', radius = 22, padding = 18, style, children, ...props }: GlassCardProps) {
  const light = tone === 'light';

  return (
    <GlassSurface
      variant={light ? 'light' : 'dark'}
      radius={radius}
      style={[
        light
          ? {
              shadowColor: colors.brand.dark,
              shadowOpacity: 0.12,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 10 },
              elevation: 5,
            }
          : {
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 12 },
              elevation: 6,
            },
        style,
      ]}
      {...props}
    >
      {/* Reflet — la lumière accroche le haut de la carte comme sur la maquette. */}
      <LinearGradient
        colors={
          light
            ? ['rgba(255,255,255,0.65)', 'rgba(255,255,255,0)']
            : ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']
        }
        locations={[0, 0.55]}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        pointerEvents="none"
      />
      <View style={{ padding }}>{children}</View>
    </GlassSurface>
  );
}
