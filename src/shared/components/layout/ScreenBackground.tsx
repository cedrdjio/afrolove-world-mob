import { View, StyleSheet, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/shared/constants/theme';

interface ScreenBackgroundProps extends ViewProps {
  theme?: 'cream' | 'deep';
}

/** Base full-bleed screen surface — Fluent style: light screens sit on a soft
 *  lavender-mist gradient, dark screens on the night gradient. Place
 *  <GlowOrb /> children for the luminous halos. */
export function ScreenBackground({ theme = 'cream', style, children, ...props }: ScreenBackgroundProps) {
  if (theme === 'deep') {
    return (
      <View style={[StyleSheet.absoluteFill, style]} {...props}>
        <LinearGradient
          colors={[colors.deep.ember, colors.deep.soft, colors.deep.black]}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, style]} {...props}>
      <LinearGradient
        colors={['#F9F5FE', '#EFE7FA', '#E3D6F5']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}
