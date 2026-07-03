import { useEffect, useMemo } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

interface GlowOrbProps {
  size: number;
  /** rgba(...) — the alpha is the halo's core intensity. */
  color: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  delay?: number;
  duration?: number;
}

let orbId = 0;

/**
 * Luminous halo — a true SVG radial gradient fading to transparent, floating
 * slowly. This is the Fluent "halo lumineux" of the charte; it replaces the
 * old concentric-circle approximation that produced visible hard rings.
 */
export function GlowOrb({ size, color, top, bottom, left, right, delay = 0, duration = 9000 }: GlowOrbProps) {
  const progress = useSharedValue(0);
  const gradientId = useMemo(() => `glow-orb-${orbId++}`, []);

  // Split "rgba(r,g,b,a)" into the solid color and its core opacity so the
  // gradient can fade that exact hue out to fully transparent.
  const { solid, alpha } = useMemo(() => {
    const match = color.match(/rgba?\(([^)]+)\)/);
    if (!match) return { solid: color, alpha: 0.3 };
    const parts = match[1].split(',').map((value) => value.trim());
    return {
      solid: `rgb(${parts[0]},${parts[1]},${parts[2]})`,
      alpha: parts[3] !== undefined ? Number(parts[3]) : 0.3,
    };
  }, [color]);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [delay, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.75 + progress.value * 0.25,
    transform: [
      { scale: 1 + progress.value * 0.1 },
      { translateX: progress.value * 14 },
      { translateY: progress.value * -10 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size, top, bottom, left, right }, animatedStyle]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={solid} stopOpacity={alpha} />
            <Stop offset="55%" stopColor={solid} stopOpacity={alpha * 0.45} />
            <Stop offset="100%" stopColor={solid} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradientId})`} />
      </Svg>
    </Animated.View>
  );
}
