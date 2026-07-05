import { View, StyleSheet, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/shared/constants/theme';
import { GlowOrb } from './GlowOrb';

interface ScreenBackgroundProps extends ViewProps {
  theme?: 'cream' | 'deep';
  /** Halos lumineux Fluent intégrés — actifs par défaut pour que chaque
   *  écran respire ; désactivable quand l'écran compose les siens. */
  halos?: boolean;
}

/** Base full-bleed screen surface — Fluent style : dégradé lavande prononcé
 *  + halos lumineux intégrés côté clair, dégradé nuit + halos côté sombre.
 *  Les enfants (GlowOrb supplémentaires…) se superposent librement. */
export function ScreenBackground({ theme = 'cream', halos = true, style, children, ...props }: ScreenBackgroundProps) {
  if (theme === 'deep') {
    return (
      <View style={[StyleSheet.absoluteFill, style]} {...props}>
        <LinearGradient
          colors={[colors.deep.ember, colors.deep.soft, colors.deep.black]}
          locations={[0, 0.45, 1]}
          start={{ x: 0.25, y: 0 }}
          end={{ x: 0.75, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {halos ? (
          <>
            <GlowOrb size={320} color="rgba(155,126,222,0.2)" top={-90} right={-80} duration={10000} />
            <GlowOrb size={260} color="rgba(139,105,214,0.14)" bottom={-70} left={-70} duration={12000} delay={1400} />
          </>
        ) : null}
        {children}
      </View>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, style]} {...props}>
      <LinearGradient
        colors={['#FBF7FF', '#F1E8FC', '#E3D3F6', '#D6C3EF']}
        locations={[0, 0.4, 0.75, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {halos ? (
        <>
          <GlowOrb size={340} color="rgba(139,105,214,0.16)" top={-100} right={-90} duration={10000} />
          <GlowOrb size={280} color="rgba(155,126,222,0.13)" bottom={-80} left={-80} duration={12000} delay={1200} />
        </>
      ) : null}
      {children}
    </View>
  );
}
