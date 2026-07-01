import { useState } from 'react';
import { View, Pressable, useWindowDimensions, ScrollView, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { PhotoPlaceholder } from '@/shared/components/ui/PhotoPlaceholder';
import { getProfileById } from '@/modules/profile/constants/mockProfileDetails';

export function FullscreenGalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const profile = getProfileById(id ?? '1');
  const [index, setIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {Array.from({ length: profile.photoCount }).map((_, i) => (
          <PhotoPlaceholder key={i} seed={profile.photoSeed + i} style={{ width, height }} showIcon iconSize={60} />
        ))}
      </ScrollView>

      <View className="absolute inset-x-0 flex-row justify-center gap-1.5 px-6" style={{ top: 58 }}>
        {Array.from({ length: profile.photoCount }).map((_, i) => (
          <View key={i} className={`h-1 flex-1 rounded-full ${i === index ? 'bg-white/90' : 'bg-white/30'}`} />
        ))}
      </View>

      <Pressable
        onPress={() => router.back()}
        className="absolute right-5 h-10 w-10 items-center justify-center rounded-full bg-white/[0.15]"
        style={{ top: 76 }}
      >
        <X size={18} color="#fff" />
      </Pressable>
    </View>
  );
}
