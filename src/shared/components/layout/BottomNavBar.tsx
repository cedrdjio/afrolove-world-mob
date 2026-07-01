import { View, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Compass, Heart, MessageCircle, User } from 'lucide-react-native';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { colors } from '@/shared/constants/theme';

const TABS = [
  { key: 'discover', href: '/(tabs)/discover', icon: Compass },
  { key: 'matches', href: '/(tabs)/matches', icon: Heart },
  { key: 'messages', href: '/(tabs)/messages', icon: MessageCircle },
  { key: 'profile', href: '/(tabs)/profile', icon: User },
] as const;

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
            const Icon = tab.icon;
            return (
              <Pressable
                key={tab.key}
                hitSlop={10}
                className="items-center gap-1"
                onPress={() => {
                  if (!active) {
                    Haptics.selectionAsync().catch(() => {});
                    router.push(tab.href as never);
                  }
                }}
              >
                <Icon
                  size={22}
                  color={active ? colors.brand.DEFAULT : 'rgba(26,8,4,0.28)'}
                  strokeWidth={active ? 2.4 : 1.8}
                  fill={active && tab.key === 'matches' ? colors.brand.DEFAULT : 'none'}
                />
                {active ? <View className="h-1 w-1 rounded-full bg-brand" /> : <View className="h-1 w-1" />}
              </Pressable>
            );
          })}
        </View>
      </GlassSurface>
    </View>
  );
}
