import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { GhostButton } from '@/shared/components/ui/GhostButton';
import { images } from '@/shared/constants/images';

/** Maquette — écrans de présentation : photo plein écran par slide,
 *  scrim aubergine et carte de verre pour le texte. */
const SLIDES = [
  {
    image: images.slideAmour,
    title: "L'amour sans frontières",
    description: 'Des rencontres afro-européennes sincères, portées par la culture et le cœur.',
  },
  {
    image: images.slideDiaspora,
    title: 'La diaspora,\npartout dans le monde',
    description: 'Rencontrez des membres de la communauté africaine où que vous soyez.',
  },
  {
    image: images.slideConfiance,
    title: 'Une communauté\nvérifiée',
    description: 'Profils vérifiés et modération active pour des rencontres en toute confiance.',
  },
] as const;

function Dot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 24 : 8);

  useEffect(() => {
    width.value = withTiming(active ? 24 : 8, { duration: 220 });
  }, [active, width]);

  const style = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <Animated.View
      className={active ? 'h-2 rounded-full bg-white' : 'h-2 rounded-full bg-white/30'}
      style={style}
    />
  );
}

export function CarouselScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const isLast = index === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      router.push('/(onboarding)/name');
      return;
    }
    scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
  };

  return (
    <View className="flex-1 bg-deep">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={{ width }} className="flex-1">
            <Image source={slide.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
            <LinearGradient
              colors={['rgba(24,15,42,0.35)', 'transparent', 'rgba(34,25,55,0.5)', 'rgba(24,15,42,0.95)']}
              locations={[0, 0.3, 0.6, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View className="flex-1 justify-end px-5" style={{ paddingBottom: 210 }}>
              <GlassSurface variant="dark" radius={26}>
                <View className="px-6 py-6">
                  <Text className="mb-2.5 font-display text-[27px] leading-[1.12] text-white">
                    {slide.title}
                  </Text>
                  <Text className="font-body text-[13.5px] leading-[21px] text-white/75">
                    {slide.description}
                  </Text>
                </View>
              </GlassSurface>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 px-6 pb-8">
        <View className="mb-6 flex-row items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <Dot key={i} active={i === index} />
          ))}
        </View>
        <GradientButton label={isLast ? 'Commencer' : 'Suivant'} onPress={handleNext} style={{ marginBottom: 12 }} />
        {!isLast ? (
          <GhostButton label="Passer" tone="onDark" onPress={() => router.push('/(onboarding)/name')} />
        ) : null}
      </View>
    </View>
  );
}
