import { Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { gradients } from '@/shared/constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
  icon?: ReactNode;
}

/** Selectable pill tag — gradient fill when selected, glass when idle. */
export function Chip({ label, selected = false, onPress, size = 'md', icon }: ChipProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    onPress?.();
  };
  const pressIn = () => (scale.value = withTiming(0.95, { duration: 90 }));
  const pressOut = () => (scale.value = withTiming(1, { duration: 150 }));

  if (selected) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable onPress={handlePress} onPressIn={pressIn} onPressOut={pressOut}>
          <LinearGradient
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className={`rounded-full ${size === 'sm' ? 'px-3.5 py-2' : 'px-4 py-2.5'}`}
            style={{
              shadowColor: '#6A4FC0',
              shadowOpacity: 0.28,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            {icon ? (
              <View className="flex-row items-center gap-1.5">
                {icon}
                <Text className="font-heading text-[11.5px] text-white">{label}</Text>
              </View>
            ) : (
              <Text className="font-heading text-[11.5px] text-white">{label}</Text>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        className={`rounded-full border-[1.5px] border-white/70 bg-white/[0.45] ${
          size === 'sm' ? 'px-3.5 py-2' : 'px-4 py-2.5'
        }`}
      >
        {icon ? (
          <View className="flex-row items-center gap-1.5">
            {icon}
            <Text className="font-heading-medium text-[11.5px] text-ink">{label}</Text>
          </View>
        ) : (
          <Text className="font-heading-medium text-[11.5px] text-ink">{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
