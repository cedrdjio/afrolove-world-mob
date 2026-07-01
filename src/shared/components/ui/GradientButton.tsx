import { Pressable, Text, ActivityIndicator, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { gradients } from '@/shared/constants/theme';
import { cn } from '@/shared/utils/cn';

interface GradientButtonProps {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function GradientButton({
  label,
  onPress,
  icon,
  iconPosition = 'right',
  loading = false,
  disabled = false,
  size = 'lg',
  style,
  className,
}: GradientButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };

  return (
    <Animated.View style={[animatedStyle, style, disabled ? { opacity: 0.5 } : null]}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => (scale.value = withTiming(0.97, { duration: 100 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
        disabled={disabled || loading}
        className={className}
      >
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={cn(
            'flex-row items-center justify-center gap-2 rounded-[18px]',
            size === 'lg' ? 'py-[17px]' : 'py-[13px]',
          )}
          style={{
            shadowColor: '#C86040',
            shadowOpacity: 0.32,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
            elevation: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              {icon && iconPosition === 'left' ? icon : null}
              <Text
                className="font-heading text-[14px] uppercase tracking-wide text-white"
                style={{ letterSpacing: 0.5 }}
              >
                {label}
              </Text>
              {icon && iconPosition === 'right' ? icon : null}
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
