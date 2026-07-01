import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/shared/constants/theme';

export function LoadingSpinner({ size = 32, color = colors.brand.DEFAULT }: { size?: number; color?: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: size / 10,
          borderColor: `${color}33`,
          borderTopColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

export function FullScreenLoader() {
  return (
    <View className="flex-1 items-center justify-center bg-cream">
      <LoadingSpinner />
    </View>
  );
}
