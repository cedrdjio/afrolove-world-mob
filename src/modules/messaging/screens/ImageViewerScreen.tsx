import { View, Pressable, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { PhotoPlaceholder } from '@/shared/components/ui/PhotoPlaceholder';
import { getConversationById } from '@/modules/matches/constants/mockMatches';

export function ImageViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const conversation = getConversationById(id ?? '1');

  return (
    <View className="flex-1 bg-black items-center justify-center">
      <PhotoPlaceholder seed={conversation.photoSeed} style={{ width, height: height * 0.7 }} showIcon iconSize={60} />
      <Pressable
        onPress={() => router.back()}
        className="absolute right-5 h-10 w-10 items-center justify-center rounded-full bg-white/[0.15]"
        style={{ top: 58 }}
      >
        <X size={18} color="#fff" />
      </Pressable>
    </View>
  );
}
