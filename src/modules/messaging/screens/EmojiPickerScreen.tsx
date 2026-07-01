import { View, Text, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { colors } from '@/shared/constants/theme';

const EMOJIS = [
  '😀', '😂', '😍', '🥰', '😘', '😊', '😉', '🤗', '🙌', '👏',
  '🔥', '💯', '✨', '🌟', '❤️', '💕', '💖', '💗', '💛', '💚',
  '🙏', '👍', '🎉', '🎶', '🌍', '☕', '🍲', '💃', '⚽', '📚',
];

export function EmojiPickerScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-cream">
      <View className="flex-row items-center justify-between px-6" style={{ paddingTop: 24, paddingBottom: 16 }}>
        <Text className="font-display text-[22px] uppercase text-ink">Emojis</Text>
        <Pressable onPress={() => router.back()}>
          <View className="h-10 w-10 items-center justify-center rounded-full border border-white/90 bg-white/80">
            <X size={17} color={colors.ink.DEFAULT} />
          </View>
        </Pressable>
      </View>

      <FlatList
        data={EMOJIS}
        numColumns={6}
        keyExtractor={(item, i) => `${item}-${i}`}
        contentContainerClassName="px-4 pb-8"
        renderItem={({ item }) => (
          <Pressable onPress={() => router.back()} className="flex-1 items-center justify-center py-3">
            <Text style={{ fontSize: 28 }}>{item}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
