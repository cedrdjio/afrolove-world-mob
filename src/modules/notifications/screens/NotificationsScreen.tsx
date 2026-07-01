import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Chip } from '@/shared/components/ui/Chip';
import { Avatar } from '@/shared/components/ui/Avatar';
import { EmptyState } from '@/shared/components/feedback';
import {
  MOCK_NOTIFICATIONS,
  NOTIFICATION_FILTERS,
  type NotificationCategory,
} from '@/modules/notifications/constants/mockNotifications';
import { colors } from '@/shared/constants/theme';

export function NotificationsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | NotificationCategory>('all');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.category === filter);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={220} color="rgba(201,134,42,0.08)" bottom={-40} left={-40} duration={10000} />
      </ScreenBackground>

      <View className="px-6" style={{ paddingTop: 64 }}>
        <View className="mb-5 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <Text style={{ fontSize: 19, color: colors.ink.DEFAULT }}>←</Text>
          </IconButton>
          <Text className="font-display text-[22px] uppercase text-ink">Notifications</Text>
          <Pressable onPress={markAllRead} className="rounded-full bg-brand/10 px-3.5 py-2">
            <Text className="font-heading text-[10.5px] uppercase text-brand">Tout lire</Text>
          </Pressable>
        </View>

        <FlashList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={NOTIFICATION_FILTERS}
          keyExtractor={(item) => item.key}
          contentContainerClassName="pb-5"
          renderItem={({ item }) => (
            <View className="mr-2">
              <Chip label={item.label} selected={filter === item.key} onPress={() => setFilter(item.key)} />
            </View>
          )}
        />
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
          title="Aucune notification"
          description="Vous êtes à jour ! Revenez plus tard."
        />
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-6 pb-8"
          renderItem={({ item }) => (
            <View
              className={`mb-2 flex-row items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 ${
                item.category === 'premium'
                  ? 'border-brand/[0.18] bg-brand/[0.08]'
                  : item.read
                    ? 'border-white/[0.85] bg-white/[0.65]'
                    : 'border-white/[0.92] bg-white/[0.78]'
              }`}
              style={!item.read ? { borderLeftWidth: 3.5, borderLeftColor: item.accentColor } : undefined}
            >
              {item.photoSeed !== undefined ? (
                <Avatar seed={`n${item.photoSeed}`} size={46} />
              ) : (
                <View
                  className="h-[46px] w-[46px] items-center justify-center rounded-full"
                  style={{ backgroundColor: `${item.accentColor}1A` }}
                >
                  <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="mb-0.5 font-heading-medium text-[13px] leading-[17px] text-ink">
                  {item.highlight ? <Text style={{ color: item.accentColor }}>{item.highlight} </Text> : null}
                  {item.title}
                </Text>
                <Text className="font-body text-[11px] text-ink/[0.38]">{item.timeAgo}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
