import { useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import type BottomSheet from '@gorhom/bottom-sheet';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { Avatar } from '@/shared/components/ui/Avatar';
import { CountBadge } from '@/shared/components/ui/Badges';
import { EmptyState } from '@/shared/components/feedback';
import { MOCK_CONVERSATIONS, type MockConversation } from '@/modules/matches/constants/mockMatches';
import { ConversationActionSheet } from '@/modules/messaging/components/ConversationActionSheet';
import { colors } from '@/shared/constants/theme';

export function ConversationListScreen() {
  const router = useRouter();
  const [conversations] = useState(MOCK_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState<MockConversation | null>(null);
  const sheetRef = useRef<BottomSheet>(null);

  const openActions = (conversation: MockConversation) => {
    setActiveConversation(conversation);
    sheetRef.current?.expand();
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={220} color="rgba(200,96,64,0.08)" top={-50} left={-50} duration={10000} />
      </ScreenBackground>

      <View className="px-[22px]" style={{ paddingTop: 64 }}>
        <Text className="mb-5 font-display text-[30px] uppercase text-ink">Messages</Text>
      </View>

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
          title="Aucune conversation"
          description="Vos conversations avec vos matches apparaîtront ici."
        />
      ) : (
        <FlashList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-[22px] pb-8"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/chat/${item.id}`)}
              onLongPress={() => openActions(item)}
              className="mb-2 flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5"
            >
              <Avatar seed={item.name} size={52} ringColor={item.isOnline ? colors.success : undefined} />
              <View className="min-w-0 flex-1">
                <View className="mb-1 flex-row justify-between">
                  <Text className="font-heading text-[14px] uppercase text-ink">{item.name}</Text>
                  <Text className="font-body-medium text-[11px] text-ink/35">{item.timestamp}</Text>
                </View>
                <Text numberOfLines={1} className="font-body text-[12.5px] text-ink-muted">
                  {item.lastMessage}
                </Text>
              </View>
              <CountBadge count={item.unreadCount} />
            </Pressable>
          )}
        />
      )}

      <ConversationActionSheet ref={sheetRef} conversation={activeConversation} />
    </View>
  );
}
