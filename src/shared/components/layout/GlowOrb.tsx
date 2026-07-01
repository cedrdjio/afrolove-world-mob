import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface GlowOrbProps {
  size: number;
  color: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  delay?: number;
  duration?: number;
}

/** Soft floating color-wash blob — approximates the design's radial-gradient glow orbs. */
export function GlowOrb({ size, color, top, bottom, left, right, delay = 0, duration = 9000 }: GlowOrbProps) {
  const progress = useSharedValue(0);

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
    transform: [
      { scale: 1 + progress.value * 0.08 },
      { translateX: progress.value * 12 },
      { translateY: progress.value * -8 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size, top, bottom, left, right }, animatedStyle]}
    >
      {/*
        Concentric same-alpha layers approximate a radial falloff (RN has no
        radial-gradient primitive) — overlapping translucent circles compound
        via normal alpha blending, brightening naturally toward the center.
      */}
      <Animated.View style={{ position: 'absolute', inset: 0, borderRadius: size / 2, backgroundColor: color }} />
      <Animated.View
        style={{ position: 'absolute', inset: size * 0.16, borderRadius: size / 2, backgroundColor: color }}
      />
      <Animated.View
        style={{ position: 'absolute', inset: size * 0.32, borderRadius: size / 2, backgroundColor: color }}
      />
    </Animated.View>
  );
}
