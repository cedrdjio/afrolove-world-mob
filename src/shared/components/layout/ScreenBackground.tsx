import { View, StyleSheet, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/shared/constants/theme';

interface ScreenBackgroundProps extends ViewProps {
  theme?: 'cream' | 'deep';
}

/** Base full-bleed screen surface. Place <GlowOrb /> children for decorative glows. */
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
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.cream.DEFAULT }, style]} {...props}>
      {children}
    </View>
  );
}
