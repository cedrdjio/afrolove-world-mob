import { View, Pressable } from 'react-native';
import { X, Heart, Bookmark } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { gradients, colors } from '@/shared/constants/theme';
import { useThemeColors } from '@/shared/theme/useThemeColors';

interface ActionButtonsProps {
  onNope: () => void;
  onLike: () => void;
  /** Signet : garder le profil du dessus dans ses favoris (≠ like). */
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

export function ActionButtons({ onNope, onLike, onToggleFavorite, isFavorite }: ActionButtonsProps) {
  const c = useThemeColors();
  // Icônes contrastées dans les deux thèmes (le X sombre disparaissait sur
  // les pastilles charbon du mode nuit).
  const nopeColor = c.isDark ? 'rgba(255,255,255,0.85)' : colors.ink.muted;
  const bookmarkColor = c.isDark ? colors.gold.DEFAULT : colors.brand.DEFAULT;
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
    <View className="flex-row items-center justify-center gap-4">
      <Pressable onPress={withHaptics(onNope)}>
        <GlassSurface
          variant="lightStrong"
          radius={25}
          style={{ width: 50, height: 50, shadowColor: colors.ink.soft, shadowOpacity: 0.14, shadowRadius: 18, shadowOffset: { width: 0, height: 6 } }}
        >
          <View className="h-[50px] w-[50px] items-center justify-center">
            <X size={20} color={nopeColor} strokeWidth={2.2} />
          </View>
        </GlassSurface>
      </Pressable>

      <Animated.View style={heartbeatStyle}>
        <Pressable onPress={withHaptics(onLike)}>
          <LinearGradient
            colors={gradients.brand}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#6A4FC0',
              shadowOpacity: 0.44,
              shadowRadius: 26,
              shadowOffset: { width: 0, height: 12 },
            }}
          >
            <Heart size={24} color="#fff" fill="#fff" />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Pressable onPress={withHaptics(onToggleFavorite)} accessibilityLabel="Ajouter aux favoris">
        <GlassSurface
          variant="lightStrong"
          radius={22}
          style={{ width: 44, height: 44, shadowColor: colors.ink.soft, shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 5 } }}
        >
          <View className="h-11 w-11 items-center justify-center">
            <Bookmark
              size={18}
              color={bookmarkColor}
              fill={isFavorite ? bookmarkColor : 'none'}
            />
          </View>
        </GlassSurface>
      </Pressable>
    </View>
  );
}
