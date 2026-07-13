import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MessageCircle } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { Avatar } from '@/shared/components/ui/Avatar';
import { CountBadge } from '@/shared/components/ui/Badges';
import { EmptyState } from '@/shared/components/feedback';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useAppError } from '@/shared/hooks/useAppError';
import { useConversationsQuery } from '@/modules/messaging/hooks/useMessaging';
import { formatConversationTime } from '@/modules/messaging/utils/time';
import { isRecentlyOnline, type Conversation } from '@/modules/messaging/types/messaging';
import { ConversationActionSheet } from '@/modules/messaging/components/ConversationActionSheet';
import { colors } from '@/shared/constants/theme';

export function ConversationListScreen() {
  const router = useRouter();
  const conversationsQuery = useConversationsQuery();
  const conversationsError = useAppError(conversationsQuery.error);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  const conversations = conversationsQuery.data ?? [];

  const openActions = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={220} color="rgba(106,79,192,0.08)" top={-50} left={-50} duration={10000} />
      </ScreenBackground>

      <View className="px-[22px]" style={{ paddingTop: 64 }}>
        <Text className="mb-5 font-display text-[30px] text-ink">Messages</Text>
      </View>

      {conversationsQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
        </View>
      ) : conversationsError ? (
        <View className="flex-1 justify-center px-6">
          <ErrorState error={conversationsError} variant="inline" onRetry={() => conversationsQuery.refetch()} />
        </View>
      ) : conversations.length === 0 ? (
        <EmptyState
          title="Aucune conversation"
          description="Vos conversations avec vos matches apparaîtront ici."
        />
      ) : (
        <FlashList
          data={conversations}
          keyExtractor={(item) => item.matchId}
          contentContainerClassName="px-[22px] pb-8"
          renderItem={({ item, index }) => {
            const online = isRecentlyOnline(item.partnerLastActiveAt);
            return (
              <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50)}>
                <Pressable
                  onPress={() => router.push(`/chat/${item.matchId}`)}
                  onLongPress={() => openActions(item)}
                  className="mb-2 flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45] px-4 py-3.5 active:opacity-85"
                >
                  <Avatar
                    source={item.partnerAvatarUrl ?? undefined}
                    seed={item.partnerFirstName}
                    size={52}
                    ringColor={online ? colors.success : undefined}
                  />
                  <View className="min-w-0 flex-1">
                    <View className="mb-1 flex-row justify-between">
                      <Text className="font-heading text-[14px] text-ink">{item.partnerFirstName}</Text>
                      <Text className="font-body-medium text-[11px] text-ink/35">
                        {formatConversationTime(item.lastMessageAt ?? item.matchedAt)}
                      </Text>
                    </View>
                    <Text
                      numberOfLines={1}
                      className={`font-body text-[12.5px] ${item.unreadCount > 0 ? 'font-body-medium text-ink' : 'text-ink-muted'}`}
                    >
                      {item.lastMessage
                        ? `${item.lastMessageFromMe ? 'Vous : ' : ''}${item.lastMessage}`
                        : 'Nouveau match — dites bonjour ! 👋'}
                    </Text>
                  </View>
                  <CountBadge count={item.unreadCount} />
                </Pressable>
              </Animated.View>
            );
          }}
        />
      )}

      {activeConversation ? (
        <ConversationActionSheet
          conversation={activeConversation}
          onClose={() => setActiveConversation(null)}
        />
      ) : null}
    </View>
  );
}
