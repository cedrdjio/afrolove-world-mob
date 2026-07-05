import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Send, Smile, MoreHorizontal, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { Avatar } from '@/shared/components/ui/Avatar';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import {
  useConversationsQuery,
  useMessagesQuery,
  useSendMessage,
  useMarkConversationRead,
} from '@/modules/messaging/hooks/useMessaging';
import { useChatComposerStore } from '@/modules/messaging/stores/chatComposerStore';
import { formatMessageTime } from '@/modules/messaging/utils/time';
import { isRecentlyOnline } from '@/modules/messaging/types/messaging';
import type { ChatMessage } from '@/modules/messaging/types/messaging';
import { colors, gradients } from '@/shared/constants/theme';

export function ChatScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const conversationsQuery = useConversationsQuery();
  const messagesQuery = useMessagesQuery(matchId);
  const sendMessage = useSendMessage(matchId);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlashListRef<ChatMessage>>(null);

  const conversation = conversationsQuery.data?.find((c) => c.matchId === matchId);
  const messages = messagesQuery.data ?? [];

  useMarkConversationRead(matchId, conversation?.unreadCount);

  // Emoji chosen in the picker route lands in the draft.
  const pendingEmoji = useChatComposerStore((s) => s.pendingEmoji);
  const setPendingEmoji = useChatComposerStore((s) => s.setPendingEmoji);
  useEffect(() => {
    if (pendingEmoji) {
      setDraft((current) => current + pendingEmoji);
      setPendingEmoji(null);
    }
  }, [pendingEmoji, setPendingEmoji]);

  useEffect(() => {
    if (messages.length === 0) return;
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, [messages.length]);

  const handleSend = () => {
    const content = draft.trim();
    if (!content || sendMessage.isPending) return;
    setDraft('');
    sendMessage.mutate(content, {
      onError: () => setDraft(content), // give the text back rather than losing it
    });
  };

  const partnerName = conversation?.partnerFirstName ?? '';
  const online = isRecentlyOnline(conversation?.partnerLastActiveAt ?? null);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScreenBackground theme="cream">
        <GlowOrb size={200} color="rgba(106,79,192,0.08)" top={-40} right={-40} duration={9500} />
      </ScreenBackground>

      <GlassSurface variant="lightStrong" radius={0} style={{ paddingTop: 52 }}>
        <View className="flex-row items-center gap-3 px-[18px] py-3">
          <Pressable onPress={() => router.back()}>
            <View className="h-10 w-10 items-center justify-center rounded-[13px] border border-white/70 bg-white/80">
              <ArrowLeft size={17} color={colors.ink.DEFAULT} strokeWidth={2} />
            </View>
          </Pressable>
          <Avatar source={conversation?.partnerAvatarUrl ?? undefined} seed={partnerName} size={48} />
          <View className="flex-1">
            <Text className="mb-0.5 font-heading text-[16px] text-ink">{partnerName}</Text>
            {online ? (
              <View className="flex-row items-center gap-1.5">
                <View className="h-1.5 w-1.5 rounded-full bg-success" />
                <Text className="font-body-medium text-[11px] text-success">En ligne</Text>
              </View>
            ) : null}
          </View>
          {conversation ? (
            <Pressable onPress={() => router.push(`/profile/${conversation.partnerId}`)}>
              <MoreHorizontal size={18} color="rgba(46,36,64,0.35)" />
            </Pressable>
          ) : null}
        </View>
      </GlassSurface>

      {messagesQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
        </View>
      ) : (
        <FlashList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-[18px] py-4"
          ListEmptyComponent={
            <View className="items-center pt-16">
              <Text className="text-center font-body text-[13px] leading-[20px] text-ink-muted">
                C'est un match avec {partnerName || 'ce profil'} !{'\n'}Envoyez le premier message. 💬
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const fromMe = item.senderId === user?.id;
            return (
              <Animated.View
                entering={FadeInUp}
                className={`mb-2.5 ${fromMe ? 'items-end' : 'items-start'}`}
              >
                {fromMe ? (
                  <LinearGradient
                    colors={gradients.brand}
                    style={{ maxWidth: '77%', borderRadius: 18, borderBottomRightRadius: 5, padding: 13 }}
                  >
                    <Text className="font-body text-[13.5px] leading-[19px] text-white">{item.content}</Text>
                    <Text className="mt-1 text-right font-body text-[9.5px] text-white/60">
                      {formatMessageTime(item.createdAt)}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View className="flex-row items-end gap-2" style={{ maxWidth: '80%' }}>
                    <Avatar source={conversation?.partnerAvatarUrl ?? undefined} seed={partnerName} size={26} />
                    <View
                      className="rounded-[18px] border-[1.5px] border-white/70 bg-white/[0.5] p-3.5"
                      style={{ borderBottomLeftRadius: 5 }}
                    >
                      <Text className="font-body text-[13.5px] leading-[19px] text-ink">{item.content}</Text>
                      <Text className="mt-1 font-body text-[9.5px] text-ink/30">
                        {formatMessageTime(item.createdAt)}
                      </Text>
                    </View>
                  </View>
                )}
              </Animated.View>
            );
          }}
        />
      )}

      <GlassSurface variant="lightStrong" radius={0}>
        <View className="flex-row items-center gap-2.5 px-[18px] py-3.5" style={{ paddingBottom: 26 }}>
          <Pressable onPress={() => router.push(`/chat/${matchId}/emoji-picker`)} hitSlop={6}>
            <Smile size={20} color="rgba(46,36,64,0.35)" />
          </Pressable>
          <View className="flex-1 rounded-full border-[1.5px] border-white/70 bg-white/[0.68] px-[18px] py-3">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Écrire un message…"
              placeholderTextColor="rgba(46,36,64,0.28)"
              className="font-body text-[13px] text-ink"
              multiline
              maxLength={2000}
            />
          </View>
          <Pressable onPress={handleSend} disabled={!draft.trim() || sendMessage.isPending}>
            <LinearGradient
              colors={gradients.brand}
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: draft.trim() ? 1 : 0.5,
              }}
            >
              {sendMessage.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Send size={18} color="#fff" />}
            </LinearGradient>
          </Pressable>
        </View>
      </GlassSurface>
    </KeyboardAvoidingView>
  );
}
