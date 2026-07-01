import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Heart, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '@/shared/components/layout';
import { PhotoPlaceholder } from '@/shared/components/ui/PhotoPlaceholder';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { GhostButton } from '@/shared/components/ui/GhostButton';
import { gradients, colors } from '@/shared/constants/theme';

function Confetti({ top, left, right, delay, color, size = 8 }: { top: number; left?: number; right?: number; delay: number; color: string; size?: number }) {
  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1800 })), -1, false),
    );
  }, [delay, float]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -float.value * 14 }], opacity: 0.5 + float.value * 0.4 }));

  return (
    <Animated.View
      style={[{ position: 'absolute', top, left, right, width: size, height: size, borderRadius: size / 3, backgroundColor: color }, style]}
    />
  );
}

export function MatchCelebrationScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const matchName = name ?? 'Kofi';

  const ringScale = useSharedValue(1);
  useEffect(() => {
    ringScale.value = withRepeat(withSequence(withTiming(1.06, { duration: 1100 }), withTiming(1, { duration: 1100 })), -1, true);
  }, [ringScale]);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: ringScale.value }] }));

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep" />

      <Confetti top={90} left={55} delay={0} color={colors.brand.light} />
      <Confetti top={130} right={65} delay={600} color={colors.gold.DEFAULT} size={7} />
      <Confetti top={72} left={170} delay={1200} color="rgba(255,255,255,0.8)" size={5} />
      <Confetti top={108} right={130} delay={400} color="#E08050" size={10} />

      <View className="flex-1 items-center justify-center" style={{ marginTop: -40 }}>
        <View className="flex-row items-center">
          <Animated.View style={[ringStyle, { zIndex: 2 }]}>
            <View
              className="h-[92px] w-[92px] overflow-hidden rounded-full"
              style={{ borderWidth: 3, borderColor: 'rgba(200,96,64,0.4)' }}
            >
              <PhotoPlaceholder seed={7} style={{ flex: 1 }} />
            </View>
          </Animated.View>
          <View
            className="z-10 h-9 w-9 items-center justify-center rounded-full"
            style={{ marginHorizontal: -10 }}
          >
            <LinearGradient
              colors={gradients.brand}
              style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
            >
              <Heart size={17} color="#fff" fill="#fff" />
            </LinearGradient>
          </View>
          <View className="h-[92px] w-[92px] overflow-hidden rounded-full" style={{ borderWidth: 3, borderColor: 'rgba(200,96,64,0.35)' }}>
            <PhotoPlaceholder seed={3} style={{ flex: 1 }} />
          </View>
        </View>
      </View>

      <View className="px-7 pb-10">
        <Text className="mb-1.5 text-center font-display-black text-[44px] uppercase leading-none tracking-wide text-white">
          C'est un Match !
        </Text>
        <Text className="mb-2.5 text-center font-display-semibold text-[18px] uppercase tracking-[3px] text-white/50">
          Vous &amp; {matchName}
        </Text>
        <Text className="mb-7 text-center font-body text-[13.5px] leading-[21px] text-white/40">
          Vous vous plaisez mutuellement !{'\n'}Envoyez le premier message.
        </Text>
        <GradientButton
          label="Envoyer un message"
          icon={<MessageCircle size={16} color="#fff" />}
          iconPosition="left"
          onPress={() => router.replace(`/chat/${id ?? '2'}`)}
          style={{ marginBottom: 12 }}
        />
        <GhostButton label="Continuer à explorer" tone="onDark" onPress={() => router.replace('/(tabs)/discover')} />
      </View>
    </View>
  );
}
