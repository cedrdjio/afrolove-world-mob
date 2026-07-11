import { View, Pressable } from 'react-native';
import { X, Star, Heart, Zap, Bookmark } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { gradients, colors } from '@/shared/constants/theme';

interface ActionButtonsProps {
  onNope: () => void;
  onSuperLike: () => void;
  onLike: () => void;
  onBoost: () => void;
  onFavorite: () => void;
  isFavorited: boolean;
}

export function ActionButtons({ onNope, onSuperLike, onLike, onBoost, onFavorite, isFavorited }: ActionButtonsProps) {
  const heartbeat = useSharedValue(1);

  useEffect(() => {
    heartbeat.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 900 }),
        withTiming(1, { duration: 900 }),
      ),
      -1,
      true,
    );
  }, [heartbeat]);

  const heartbeatStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartbeat.value }] }));

  const withHaptics = (fn: () => void) => () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    fn();
  };

  return (
    <View className="flex-row items-center justify-center gap-3.5">
      <Pressable onPress={withHaptics(onFavorite)}>
        <GlassSurface
          variant="lightStrong"
          radius={24}
          style={{ width: 48, height: 48, shadowColor: colors.ink.soft, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } }}
        >
          <View className="h-12 w-12 items-center justify-center">
            <Bookmark
              size={19}
              color={colors.gold.DEFAULT}
              fill={isFavorited ? colors.gold.DEFAULT : 'transparent'}
              strokeWidth={2}
            />
          </View>
        </GlassSurface>
      </Pressable>

      <Pressable onPress={withHaptics(onNope)}>
        <GlassSurface
          variant="lightStrong"
          radius={29}
          style={{ width: 58, height: 58, shadowColor: colors.ink.soft, shadowOpacity: 0.14, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } }}
        >
          <View className="h-[58px] w-[58px] items-center justify-center">
            <X size={22} color={colors.ink.muted} strokeWidth={2.2} />
          </View>
        </GlassSurface>
      </Pressable>

      <Pressable onPress={withHaptics(onSuperLike)}>
        <GlassSurface
          variant="lightStrong"
          radius={24}
          style={{ width: 48, height: 48, shadowColor: colors.ink.soft, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } }}
        >
          <View className="h-12 w-12 items-center justify-center">
            <Star size={19} color={colors.gold.DEFAULT} fill={colors.gold.DEFAULT} />
          </View>
        </GlassSurface>
      </Pressable>

      <Animated.View style={heartbeatStyle}>
        <Pressable onPress={withHaptics(onLike)}>
          <LinearGradient
            colors={gradients.brand}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#6A4FC0',
              shadowOpacity: 0.44,
              shadowRadius: 26,
              shadowOffset: { width: 0, height: 12 },
            }}
          >
            <Heart size={28} color="#fff" fill="#fff" />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Pressable onPress={withHaptics(onBoost)}>
        <GlassSurface
          variant="lightStrong"
          radius={24}
          style={{ width: 48, height: 48, shadowColor: colors.ink.soft, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } }}
        >
          <View className="h-12 w-12 items-center justify-center">
            <Zap size={19} color={colors.brand.DEFAULT} fill={colors.brand.DEFAULT} />
          </View>
        </GlassSurface>
      </Pressable>
    </View>
  );
}
