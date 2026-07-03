import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Bell, ArrowLeft, Heart, MessageCircle, Star, ShieldCheck } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Chip } from '@/shared/components/ui/Chip';
import { EmptyState } from '@/shared/components/feedback';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useAppError } from '@/shared/hooks/useAppError';
import { useNotificationsQuery, useMarkAllNotificationsRead } from '@/modules/notifications/hooks/useNotifications';
import type { AppNotification, NotificationType } from '@/modules/notifications/services/notificationsService';
import { formatConversationTime } from '@/modules/messaging/utils/time';
import { colors } from '@/shared/constants/theme';

const FILTERS: { key: 'all' | NotificationType; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'match', label: 'Matches' },
  { key: 'message', label: 'Messages' },
  { key: 'like', label: 'Likes' },
  { key: 'kyc', label: 'Vérification' },
];

const TYPE_STYLE: Record<NotificationType, { Icon: LucideIcon; accent: string }> = {
  match: { Icon: Heart, accent: colors.brand.DEFAULT },
  message: { Icon: MessageCircle, accent: colors.gold.DEFAULT },
  like: { Icon: Star, accent: '#9B7EDE' },
  kyc: { Icon: ShieldCheck, accent: colors.success },
};

export function NotificationsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | NotificationType>('all');
  const notificationsQuery = useNotificationsQuery();
  const markAllRead = useMarkAllNotificationsRead();
  const notificationsError = useAppError(notificationsQuery.error);

  const notifications = notificationsQuery.data ?? [];
  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);
  const hasUnread = notifications.some((n) => !n.read);

  const openNotification = (notification: AppNotification) => {
    const matchId = notification.data.match_id;
    if ((notification.type === 'message' || notification.type === 'match') && typeof matchId === 'string') {
      router.push(`/chat/${matchId}`);
    } else if (notification.type === 'kyc') {
      router.push('/kyc/pending');
    }
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={220} color="rgba(155,126,222,0.08)" bottom={-40} left={-40} duration={10000} />
      </ScreenBackground>

      <View className="px-6" style={{ paddingTop: 64 }}>
        <View className="mb-5 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
          </IconButton>
          <Text className="font-display text-[22px] uppercase text-ink">Notifications</Text>
          {hasUnread ? (
            <Pressable
              onPress={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="rounded-full bg-brand/10 px-3.5 py-2"
            >
              <Text className="font-heading text-[10.5px] uppercase text-brand">
                {markAllRead.isPending ? '…' : 'Tout lire'}
              </Text>
            </Pressable>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>

        <FlashList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item.key}
          contentContainerClassName="pb-5"
          renderItem={({ item }) => (
            <View className="mr-2">
              <Chip label={item.label} selected={filter === item.key} onPress={() => setFilter(item.key)} />
            </View>
          )}
        />
      </View>

      {notificationsQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
        </View>
      ) : notificationsError ? (
        <View className="flex-1 justify-center px-6">
          <ErrorState error={notificationsError} variant="inline" onRetry={() => notificationsQuery.refetch()} />
        </View>
      ) : filtered.length === 0 ? (
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
          renderItem={({ item, index }) => {
            const { Icon, accent } = TYPE_STYLE[item.type];
            return (
              <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).springify().damping(17)}>
                <Pressable
                  onPress={() => openNotification(item)}
                  className={`mb-2 flex-row items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 active:opacity-85 ${
                    item.read ? 'border-white/[0.85] bg-white/[0.65]' : 'border-white/[0.92] bg-white/[0.78]'
                  }`}
                  style={!item.read ? { borderLeftWidth: 3.5, borderLeftColor: accent } : undefined}
                >
                  <View
                    className="h-[46px] w-[46px] items-center justify-center rounded-full"
                    style={{ backgroundColor: `${accent}1A` }}
                  >
                    <Icon size={22} color={accent} />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-0.5 font-heading-medium text-[13px] leading-[17px] text-ink">
                      {item.title}
                    </Text>
                    {item.body ? (
                      <Text numberOfLines={1} className="mb-0.5 font-body text-[11.5px] text-ink-muted">
                        {item.body}
                      </Text>
                    ) : null}
                    <Text className="font-body text-[11px] text-ink/[0.38]">
                      {formatConversationTime(item.createdAt)}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            );
          }}
        />
      )}
    </View>
  );
}
