import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Heart, Globe, ShieldCheck } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { BrandLogo } from '@/shared/components/ui/BrandLogo';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { GhostButton } from '@/shared/components/ui/GhostButton';
import { gradients } from '@/shared/constants/theme';

const SLIDES = [
  {
    Icon: Heart,
    brand: true,
    title: 'Rencontrez\nle monde entier',
    description: 'Des rencontres afro-européennes sincères, portées par la culture et le cœur.',
  },
  {
    Icon: Globe,
    brand: false,
    title: 'La diaspora,\npartout dans le monde',
    description: 'Rencontrez des membres de la communauté africaine où que vous soyez.',
  },
  {
    Icon: ShieldCheck,
    brand: false,
    title: 'Une communauté\nvérifiée',
    description: 'Profils vérifiés et modération active pour des rencontres en toute confiance.',
  },
] as const;

function Dot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 24 : 8);

  useEffect(() => {
    width.value = withSpring(active ? 24 : 8, { damping: 16, stiffness: 220 });
  }, [active, width]);

  const style = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <Animated.View
      className={active ? 'h-2 rounded-full bg-brand' : 'h-2 rounded-full bg-ink/[0.14]'}
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
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={320} color="rgba(139,105,214,0.2)" top={-80} right={-70} duration={9500} />
        <GlowOrb size={260} color="rgba(155,126,222,0.16)" bottom={120} left={-60} duration={11000} delay={1200} />
      </ScreenBackground>

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
          <View key={i} style={{ width }} className="flex-1 items-center justify-center px-7">
            <GlassSurface variant="lightSoft" radius={34} style={{ width: '100%' }}>
              <View className="items-center px-7 py-10">
                {slide.brand ? (
                  <Animated.View entering={FadeInDown.springify().damping(13)}>
                    <BrandLogo size={116} style={{ marginBottom: 28 }} />
                  </Animated.View>
                ) : (
                  <Animated.View entering={FadeInDown.springify().damping(13)}>
                    <LinearGradient
                      colors={gradients.brand}
                      style={{
                        width: 104,
                        height: 104,
                        borderRadius: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 28,
                        shadowColor: '#6A4FC0',
                        shadowOpacity: 0.35,
                        shadowRadius: 28,
                        shadowOffset: { width: 0, height: 14 },
                      }}
                    >
                      <slide.Icon size={42} color="#fff" strokeWidth={1.6} />
                    </LinearGradient>
                  </Animated.View>
                )}
                <Text className="mb-3 text-center font-display text-[28px] leading-[1.08] text-ink">
                  {slide.title}
                </Text>
                <Text className="text-center font-body text-[13.5px] leading-[21px] text-ink-muted">
                  {slide.description}
                </Text>
              </View>
            </GlassSurface>
          </View>
        ))}
      </ScrollView>

      <View className="px-6 pb-8">
        <View className="mb-6 flex-row items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <Dot key={i} active={i === index} />
          ))}
        </View>
        <GradientButton label={isLast ? 'Commencer' : 'Suivant'} onPress={handleNext} style={{ marginBottom: 12 }} />
        {!isLast ? (
          <GhostButton label="Passer" tone="onLight" onPress={() => router.push('/(onboarding)/name')} />
        ) : null}
      </View>
    </View>
  );
}
