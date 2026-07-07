import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { cn } from '@/shared/utils/cn';

interface GhostButtonProps {
  label: string;
  onPress?: () => void;
  tone?: 'onDark' | 'onLight';
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function GhostButton({ label, onPress, tone = 'onDark', style, className }: GhostButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    onPress?.();
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => (scale.value = withTiming(0.97, { duration: 100 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
        className={cn(
          'w-full items-center justify-center rounded-[18px] border-[1.5px] py-4',
          tone === 'onDark' ? 'border-white/[0.28] bg-white/[0.14]' : 'border-white/70 bg-white/[0.5]',
          className,
        )}
      >
        <Text
          className={cn(
            'font-heading text-[14px] tracking-wide',
            tone === 'onDark' ? 'text-white' : 'text-ink',
          )}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
