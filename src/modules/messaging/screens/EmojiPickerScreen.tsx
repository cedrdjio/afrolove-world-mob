import { View, Text, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useChatComposerStore } from '@/modules/messaging/stores/chatComposerStore';
import { colors } from '@/shared/constants/theme';

const EMOJIS = [
  '😀', '😂', '😍', '🥰', '😘', '😊', '😉', '🤗', '🙌', '👏',
  '🔥', '💯', '✨', '🌟', '❤️', '💕', '💖', '💗', '💛', '💚',
  '🙏', '👍', '🎉', '🎶', '🌍', '☕', '🍲', '💃', '⚽', '📚',
];

export function EmojiPickerScreen() {
  const router = useRouter();
  const setPendingEmoji = useChatComposerStore((s) => s.setPendingEmoji);

  const pick = (emoji: string) => {
    setPendingEmoji(emoji);
    router.back();
  };

  return (
    <View className="flex-1 bg-cream">
      <View className="flex-row items-center justify-between px-6" style={{ paddingTop: 24, paddingBottom: 16 }}>
        <Text className="font-display text-[22px] text-ink">Emojis</Text>
        <Pressable onPress={() => router.back()}>
          <View className="h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/80">
            <X size={17} color={colors.ink.DEFAULT} />
          </View>
        </Pressable>
      </View>

      <FlashList
        data={EMOJIS}
        numColumns={6}
        keyExtractor={(item, i) => `${item}-${i}`}
        contentContainerClassName="px-4 pb-8"
        renderItem={({ item }) => (
          <Pressable onPress={() => pick(item)} className="flex-1 items-center justify-center py-3 active:opacity-60">
            <Text style={{ fontSize: 28 }}>{item}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
