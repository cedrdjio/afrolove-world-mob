import { useEffect } from 'react';
import { type DimensionValue } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}

/** Shimmering placeholder block for any async content (profile cards,
 *  lists, images) that hasn't resolved yet. */
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(0.7, { duration: 650 }), withTiming(0.35, { duration: 650 })), -1, false);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: 'rgba(26,8,4,0.08)' },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCircle({ size = 48 }: { size?: number }) {
  return <Skeleton width={size} height={size} radius={size / 2} />;
}
