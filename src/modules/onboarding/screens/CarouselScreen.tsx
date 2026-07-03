import { useRef, useState } from 'react';
import { View, Text, ScrollView, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Globe, ShieldCheck } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { GhostButton } from '@/shared/components/ui/GhostButton';
import { gradients } from '@/shared/constants/theme';

const SLIDES = [
  {
    Icon: Heart,
    title: 'Des rencontres\nauthentiques',
    description: 'Connectez-vous avec des célibataires qui partagent vos valeurs et votre culture.',
  },
  {
    Icon: Globe,
    title: 'La diaspora,\npartout dans le monde',
    description: "Rencontrez des membres de la communauté africaine où que vous soyez.",
  },
  {
    Icon: ShieldCheck,
    title: 'Une communauté\nvérifiée',
    description: 'Profils vérifiés et modération active pour des rencontres en toute confiance.',
  },
] as const;

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
        <GlowOrb size={280} color="rgba(106,79,192,0.11)" top={-70} right={-60} duration={9500} />
        <GlowOrb size={220} color="rgba(155,126,222,0.09)" bottom={-30} left={-40} duration={11000} delay={1200} />
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
          <View key={i} style={{ width }} className="flex-1 items-center justify-center px-9">
            <LinearGradient
              colors={gradients.brand}
              style={{
                width: 108,
                height: 108,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 32,
                shadowColor: '#6A4FC0',
                shadowOpacity: 0.32,
                shadowRadius: 28,
                shadowOffset: { width: 0, height: 14 },
              }}
            >
              <slide.Icon size={44} color="#fff" strokeWidth={1.6} />
            </LinearGradient>
            <Text className="mb-3 text-center font-display text-[30px] uppercase leading-[1.05] text-ink">
              {slide.title}
            </Text>
            <Text className="text-center font-body text-[13.5px] leading-[21px] text-ink-muted">
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View className="px-6 pb-8">
        <View className="mb-6 flex-row items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={i === index ? 'h-2 w-6 rounded-full bg-brand' : 'h-2 w-2 rounded-full bg-ink/[0.14]'}
            />
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
