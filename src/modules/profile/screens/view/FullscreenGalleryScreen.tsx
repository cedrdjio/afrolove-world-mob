import { useState } from 'react';
import {
  View,
  Pressable,
  useWindowDimensions,
  ScrollView,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useAnimatedReaction,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  FadeIn,
} from 'react-native-reanimated';
import { FullScreenLoader } from '@/shared/components/feedback';
import { useOtherProfileQuery } from '@/modules/profile/hooks/useOtherProfileQuery';

const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;
const AnimatedImage = Animated.createAnimatedComponent(Image);

function ZoomableImage({
  uri,
  width,
  height,
  onZoomChange,
}: {
  uri: string;
  width: number;
  height: number;
  onZoomChange: (zoomed: boolean) => void;
}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(MAX_ZOOM, Math.max(1, savedScale.value * event.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1) {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200, overshootClamping: true });
        translateY.value = withSpring(0, { damping: 20, stiffness: 200, overshootClamping: true });
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const pan = Gesture.Pan()
    .enabled(true)
    .onUpdate((event) => {
      if (scale.value <= 1) return;
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const next = scale.value > 1 ? 1 : DOUBLE_TAP_ZOOM;
      scale.value = withTiming(next, { duration: 220 });
      savedScale.value = next;
      if (next === 1) {
        translateX.value = withTiming(0, { duration: 220 });
        translateY.value = withTiming(0, { duration: 220 });
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  // Disables the parent ScrollView's horizontal paging while this image is
  // zoomed in, so panning to inspect a zoomed photo doesn't also flip pages.
  useAnimatedReaction(
    () => scale.value > 1.02,
    (zoomed, previouslyZoomed) => {
      if (zoomed !== previouslyZoomed) runOnJS(onZoomChange)(zoomed);
    },
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={{ width, height }}>
        <AnimatedImage
          source={{ uri }}
          style={[{ width, height }, animatedStyle]}
          contentFit="contain"
          cachePolicy="memory-disk"
          entering={FadeIn.duration(250)}
        />
      </Animated.View>
    </GestureDetector>
  );
}

export function FullscreenGalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const profileQuery = useOtherProfileQuery(id);
  const [index, setIndex] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  if (!profileQuery.data) return <FullScreenLoader />;

  const photos = profileQuery.data.photos;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        horizontal
        pagingEnabled
        scrollEnabled={scrollEnabled}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {photos.map((photo) => (
          <ZoomableImage
            key={photo.id}
            uri={photo.url}
            width={width}
            height={height}
            onZoomChange={(zoomed) => setScrollEnabled(!zoomed)}
          />
        ))}
      </ScrollView>

      <View className="absolute inset-x-0 flex-row justify-center gap-1.5 px-6" style={{ top: 58 }}>
        {photos.map((photo, i) => (
          <View key={photo.id} className={`h-1 flex-1 rounded-full ${i === index ? 'bg-white/90' : 'bg-white/30'}`} />
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
