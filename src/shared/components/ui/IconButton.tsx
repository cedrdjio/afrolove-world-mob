import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassSurface } from './GlassSurface';
import { colors } from '@/shared/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface IconButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'light' | 'dark';
  size?: number;
  radius?: number;
  showDot?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  children,
  onPress,
  variant = 'light',
  size = 44,
  radius = 15,
  showDot = false,
  style,
}: IconButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => (scale.value = withTiming(0.92, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[animatedStyle, style]}
    >
      <GlassSurface
        variant={variant === 'light' ? 'lightStrong' : 'dark'}
        radius={radius}
        style={{
          width: size,
          height: size,
          shadowColor: colors.ink.soft,
          shadowOpacity: 0.09,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </View>
      </GlassSurface>
      {showDot ? (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 9,
            height: 9,
            borderRadius: 5,
            backgroundColor: colors.brand.DEFAULT,
            borderWidth: 2,
            borderColor: variant === 'light' ? colors.cream.DEFAULT : colors.deep.DEFAULT,
          }}
        />
      ) : null}
    </AnimatedPressable>
  );
}
