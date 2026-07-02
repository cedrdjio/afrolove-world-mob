import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
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

  return <Animated.View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brand.DEFAULT }, style]} />;
}

const MIN_BRANDING_DELAY_MS = 2000;

export function SplashScreen() {
  const router = useRouter();
  const float = useSharedValue(0);
  const [brandingDelayElapsed, setBrandingDelayElapsed] = useState(false);
  const initialRoute = useInitialRoute();

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-9, { duration: 2250, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2250, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );

    const timer = setTimeout(() => setBrandingDelayElapsed(true), MIN_BRANDING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [float]);

  useEffect(() => {
    if (brandingDelayElapsed && initialRoute) {
      router.replace(initialRoute);
    }
  }, [brandingDelayElapsed, initialRoute, router]);

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={260} color="rgba(200,96,64,0.25)" top={100} left={30} duration={8000} />
        <GlowOrb size={200} color="rgba(201,134,42,0.18)" bottom={160} right={20} duration={10000} delay={2000} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center">
        <Animated.View style={logoStyle} className="mb-6 items-center">
          <View className="relative items-center justify-center">
            <View
              className="absolute rounded-[37px] border border-gold/20"
              style={{ width: 126, height: 126 }}
            />
            <View
              className="absolute rounded-[46px] border border-gold/[0.09]"
              style={{ width: 144, height: 144 }}
            />
            <Image
              source={images.logoDark}
              style={{ width: 108, height: 108, borderRadius: 28 }}
              contentFit="cover"
            />
          </View>
        </Animated.View>
        <Text className="font-display-black text-[40px] uppercase tracking-[3px] text-white">AfriLove</Text>
        <Text className="mt-1.5 font-heading text-[11px] uppercase tracking-[9px] text-gold">World</Text>
        <Text className="mt-5 text-center font-body italic text-[14px] leading-6 text-white/30">
          L'amour authentique,{'\n'}enraciné dans nos valeurs.
        </Text>
      </View>

      <View className="absolute inset-x-0 bottom-14 flex-row items-center justify-center gap-2">
        <LoadingDot delay={0} />
        <LoadingDot delay={200} />
        <LoadingDot delay={400} />
      </View>
    </View>
  );
}
