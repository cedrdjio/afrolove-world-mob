import { useRef, useState } from 'react';
import { View, Text, Pressable, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send, Smile, Image as ImageIcon, MoreHorizontal } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { Avatar } from '@/shared/components/ui/Avatar';
import { getConversationById } from '@/modules/matches/constants/mockMatches';
import { INITIAL_MESSAGES, type MockMessage } from '@/modules/messaging/constants/mockMessages';
import { colors, gradients } from '@/shared/constants/theme';

export function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const conversation = getConversationById(id ?? '1');
  const [messages, setMessages] = useState<MockMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `${prev.length + 1}`, text: draft.trim(), fromMe: true, timestamp: 'Maintenant' },
    ]);
    setDraft('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScreenBackground theme="cream">
        <GlowOrb size={200} color="rgba(200,96,64,0.08)" top={-40} right={-40} duration={9500} />
      </ScreenBackground>

      <GlassSurface variant="lightStrong" radius={0} style={{ paddingTop: 52 }}>
        <View className="flex-row items-center gap-3 px-[18px] py-3">
          <Pressable onPress={() => router.back()}>
            <View className="h-10 w-10 items-center justify-center rounded-[13px] border border-white/90 bg-white/80">
              <Text style={{ fontSize: 17, color: colors.ink.DEFAULT }}>←</Text>
            </View>
          </Pressable>
          <Avatar seed={conversation.name} size={48} />
          <View className="flex-1">
            <Text className="mb-0.5 font-heading text-[16px] uppercase text-ink">{conversation.name}</Text>
            {conversation.isOnline ? (
              <View className="flex-row items-center gap-1.5">
                <View className="h-1.5 w-1.5 rounded-full bg-success" />
                <Text className="font-body-medium text-[11px] text-success">En ligne</Text>
              </View>
            ) : null}
          </View>
          <Pressable onPress={() => router.push(`/profile/${conversation.id}`)}>
            <MoreHorizontal size={18} color="rgba(26,8,4,0.35)" />
          </Pressable>
        </View>
      </GlassSurface>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-[18px] py-4 gap-2.5"
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View className={item.fromMe ? 'items-end' : 'items-start'}>
            {item.fromMe ? (
              <LinearGradient
                colors={gradients.brand}
                style={{ maxWidth: '77%', borderRadius: 18, borderBottomRightRadius: 5, padding: 13 }}
              >
                <Text className="font-body text-[13.5px] leading-[19px] text-white">{item.text}</Text>
              </LinearGradient>
            ) : (
              <View className="flex-row items-end gap-2" style={{ maxWidth: '80%' }}>
                <Avatar seed={conversation.name} size={26} />
                <View className="rounded-[18px] border-[1.5px] border-white/90 bg-white/75 p-3.5" style={{ borderBottomLeftRadius: 5 }}>
                  <Text className="font-body text-[13.5px] leading-[19px] text-ink">{item.text}</Text>
                </View>
              </View>
            )}
          </View>
        )}
      />

      <GlassSurface variant="lightStrong" radius={0}>
        <View className="flex-row items-center gap-2.5 px-[18px] py-3.5" style={{ paddingBottom: 26 }}>
          <Pressable onPress={() => router.push(`/chat/${conversation.id}/emoji-picker`)}>
            <Smile size={20} color="rgba(26,8,4,0.35)" />
          </Pressable>
          <Pressable onPress={() => router.push(`/chat/${conversation.id}/gif-picker`)}>
            <ImageIcon size={20} color="rgba(26,8,4,0.35)" />
          </Pressable>
          <View className="flex-1 rounded-full border-[1.5px] border-white/90 bg-white/[0.68] px-[18px] py-3">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Écrire un message…"
              placeholderTextColor="rgba(26,8,4,0.28)"
              className="font-body text-[13px] text-ink"
            />
          </View>
          <Pressable onPress={handleSend}>
            <LinearGradient
              colors={gradients.brand}
              style={{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      </GlassSurface>
    </KeyboardAvoidingView>
  );
}
