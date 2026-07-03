import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { images } from '@/shared/constants/images';
import { colors } from '@/shared/constants/theme';
import { useInitialRoute } from '@/modules/auth/hooks/useInitialRoute';

function LoadingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.3, { duration: 700 })), -1, false),
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gold.DEFAULT }, style]} />;
}

const MIN_BRANDING_DELAY_MS = 2000;

export function SplashScreen() {
  const router = useRouter();
  const [brandingDelayElapsed, setBrandingDelayElapsed] = useState(false);
  const initialRoute = useInitialRoute();

  // Entrance: the glass tile springs in, then floats; the halo breathes.
  const enter = useSharedValue(0);
  const float = useSharedValue(0);
  const halo = useSharedValue(0);

  useEffect(() => {
    enter.value = withSpring(1, { damping: 12, stiffness: 110 });
    float.value = withDelay(
      700,
      withRepeat(
        withSequence(
          withTiming(-9, { duration: 2250, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2250, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
    halo.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );

    const timer = setTimeout(() => setBrandingDelayElapsed(true), MIN_BRANDING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enter, float, halo]);

  useEffect(() => {
    if (brandingDelayElapsed && initialRoute) {
      router.replace(initialRoute);
    }
  }, [brandingDelayElapsed, initialRoute, router]);

  const tileStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: 0.6 + enter.value * 0.4 }, { translateY: float.value }],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + halo.value * 0.4,
    transform: [{ scale: 1 + halo.value * 0.12 }, { translateY: float.value }],
  }));

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={300} color="rgba(139,105,214,0.22)" top={90} left={20} duration={8000} />
        <GlowOrb size={230} color="rgba(155,126,222,0.16)" bottom={150} right={10} duration={10000} delay={2000} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center">
        <View className="mb-7 items-center justify-center">
          {/* Halo lumineux derrière la pastille */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 210,
                height: 210,
                borderRadius: 105,
                backgroundColor: 'rgba(155,126,222,0.25)',
              },
              haloStyle,
            ]}
          />
          {/* Pastille verre — construction officielle de la charte */}
          <Animated.View
            style={[
              {
                width: 132,
                height: 132,
                borderRadius: 38,
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.28)',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#180F2A',
                shadowOpacity: 0.4,
                shadowRadius: 34,
                shadowOffset: { width: 0, height: 16 },
              },
              tileStyle,
            ]}
          >
            <Image source={images.logoDark} style={{ width: 100, height: 100 }} contentFit="contain" />
          </Animated.View>
        </View>

        <Animated.View entering={FadeIn.delay(280).duration(600)} className="items-center">
          <Text className="font-display-black text-[38px] tracking-[3px] text-white">AFRILOVE</Text>
          <View className="mt-1.5 flex-row items-center gap-3">
            <View className="h-[2.5px] w-9 rounded-full bg-gold" />
            <Text className="font-heading text-[13px] tracking-[10px] text-gold" style={{ marginRight: -10 }}>
              WORLD
            </Text>
            <View className="h-[2.5px] w-9 rounded-full bg-gold" />
          </View>
          <Text className="mt-5 text-center font-body italic text-[14px] leading-6 text-white/40">
            L'amour sans frontières.
          </Text>
        </Animated.View>
      </View>

      <View className="absolute inset-x-0 bottom-14 flex-row items-center justify-center gap-2">
        <LoadingDot delay={0} />
        <LoadingDot delay={200} />
        <LoadingDot delay={400} />
      </View>
    </View>
  );
}
