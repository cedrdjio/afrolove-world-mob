import { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Compass, Heart, MessageCircle, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { colors } from '@/shared/constants/theme';

const TABS = [
  { key: 'discover', href: '/(tabs)/discover', icon: Compass },
  { key: 'matches', href: '/(tabs)/matches', icon: Heart },
  { key: 'messages', href: '/(tabs)/messages', icon: MessageCircle },
  { key: 'profile', href: '/(tabs)/profile', icon: User },
] as const;

function TabItem({
  icon: Icon,
  active,
  fillWhenActive,
  onPress,
}: {
  icon: LucideIcon;
  active: boolean;
  fillWhenActive: boolean;
  onPress: () => void;
}) {
  const pop = useSharedValue(active ? 1 : 0);

  // Becoming active bounces the icon; leaving fades it back — the tab bar
  // responds to every switch instead of just repainting colors.
  useEffect(() => {
    pop.value = active
      ? withSpring(1, { damping: 11, stiffness: 220 })
      : withTiming(0, { duration: 180 });
  }, [active, pop]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pop.value * 0.18 }, { translateY: -pop.value * 1.5 }],
  }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [{ scale: pop.value }],
  }));

  return (
    <Pressable hitSlop={10} className="items-center gap-1" onPress={onPress}>
      <Animated.View style={iconStyle}>
        <Icon
          size={22}
          color={active ? colors.brand.DEFAULT : 'rgba(26,8,4,0.28)'}
          strokeWidth={active ? 2.4 : 1.8}
          fill={active && fillWhenActive ? colors.brand.DEFAULT : 'none'}
        />
      </Animated.View>
      <Animated.View style={dotStyle} className="h-1 w-1 rounded-full bg-brand" />
    </Pressable>
  );
}

export function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View pointerEvents="box-none" className="absolute inset-x-0 bottom-6 items-center">
      <GlassSurface
        variant="lightStrong"
        radius={999}
        style={{
          shadowColor: colors.ink.soft,
          shadowOpacity: 0.12,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 },
        }}
      >
        <View className="flex-row items-center gap-8 px-7 py-3.5">
          {TABS.map((tab) => {
            const active = pathname.includes(tab.key);
            return (
              <TabItem
                key={tab.key}
                icon={tab.icon}
                active={active}
                fillWhenActive={tab.key === 'matches'}
                onPress={() => {
                  if (!active) {
                    Haptics.selectionAsync().catch(() => {});
                    router.push(tab.href as never);
                  }
                }}
              />
            );
          })}
        </View>
      </GlassSurface>
    </View>
  );
}
