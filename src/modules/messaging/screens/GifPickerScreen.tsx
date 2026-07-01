import { View, Text, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { PhotoPlaceholder } from '@/shared/components/ui/PhotoPlaceholder';
import { colors } from '@/shared/constants/theme';

const GIF_LABELS = [
  'Amour 💕', 'Danse 💃', 'Rire 😂', 'Câlin 🤗', 'Cœur ❤️', 'Fête 🎉',
  'Bisous 😘', 'Bravo 👏', 'Wow 😍', 'Coucou 👋', 'Merci 🙏', 'Oui !',
];

export function GifPickerScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-cream">
      <View className="flex-row items-center justify-between px-6" style={{ paddingTop: 24, paddingBottom: 16 }}>
        <Text className="font-display text-[22px] uppercase text-ink">Choisir un GIF</Text>
        <Pressable onPress={() => router.back()}>
          <View className="h-10 w-10 items-center justify-center rounded-full border border-white/90 bg-white/80">
            <X size={17} color={colors.ink.DEFAULT} />
          </View>
        </Pressable>
      </View>

      <FlashList
        data={GIF_LABELS}
        numColumns={2}
        keyExtractor={(item) => item}
        contentContainerClassName="px-[18px] pb-8"
        renderItem={({ item, index }) => (
          <View className="flex-1 p-1.5">
            <Pressable onPress={() => router.back()} className="overflow-hidden rounded-2xl" style={{ aspectRatio: 1 }}>
              <PhotoPlaceholder seed={index} style={{ flex: 1 }} />
              <View className="absolute inset-x-0 bottom-0 bg-black/30 px-2.5 py-2">
                <Text className="font-heading-semibold text-[11px] text-white">{item}</Text>
              </View>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}
