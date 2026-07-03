import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Heart, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { Avatar } from '@/shared/components/ui/Avatar';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { GhostButton } from '@/shared/components/ui/GhostButton';
import { useConversationsQuery } from '@/modules/messaging/hooks/useMessaging';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
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
  const matchName = name ?? '';

  // The chat route needs the MATCH id, not the partner's profile id — look
  // the fresh match up in the conversations list (invalidated on match).
  const conversationsQuery = useConversationsQuery();
  const conversation = conversationsQuery.data?.find((c) => c.partnerId === id);
  const myProfile = useProfileQuery().data;

  const ringScale = useSharedValue(1);
  const heartPop = useSharedValue(0);
  useEffect(() => {
    ringScale.value = withRepeat(withSequence(withTiming(1.06, { duration: 1100 }), withTiming(1, { duration: 1100 })), -1, true);
    heartPop.value = withDelay(350, withSpring(1, { damping: 9, stiffness: 160 }));
  }, [ringScale, heartPop]);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: ringScale.value }] }));
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartPop.value }] }));

  const openChat = () => {
    if (conversation) {
      router.replace(`/chat/${conversation.matchId}`);
    } else {
      // Match row not in cache yet — the conversation list will show it first.
      router.replace('/(tabs)/messages');
    }
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={340} color="rgba(139,105,214,0.3)" top={110} left={20} duration={7000} />
        <GlowOrb size={240} color="rgba(155,126,222,0.2)" bottom={190} right={-20} duration={9000} delay={1500} />
      </ScreenBackground>

      <Confetti top={90} left={55} delay={0} color={colors.brand.light} />
      <Confetti top={130} right={65} delay={600} color={colors.gold.DEFAULT} size={7} />
      <Confetti top={72} left={170} delay={1200} color="rgba(255,255,255,0.8)" size={5} />
      <Confetti top={108} right={130} delay={400} color={colors.gold.light} size={10} />

      <View className="flex-1 items-center justify-center" style={{ marginTop: -30 }}>
        <Animated.View entering={FadeIn.duration(400)} className="mb-9 items-center">
          <Text className="mb-2 text-center font-heading text-[12px] uppercase tracking-[5px] text-gold">
            Coup de cœur mutuel
          </Text>
          <Text className="text-center font-display-black text-[46px] leading-none tracking-wide text-white">
            C'est un{'\n'}match !
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify().damping(12)} className="flex-row items-center">
          <Animated.View style={[ringStyle, { zIndex: 2 }]}>
            <View
              className="overflow-hidden rounded-full"
              style={{ borderWidth: 3, borderColor: 'rgba(255,255,255,0.55)' }}
            >
              <Avatar source={myProfile?.avatarUrl ?? undefined} seed={myProfile?.firstName ?? 'moi'} size={96} />
            </View>
          </Animated.View>
          <Animated.View className="z-10" style={[heartStyle, { marginHorizontal: -12 }]}>
            <LinearGradient
              colors={gradients.brand}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.4)',
                shadowColor: '#5B3E9E',
                shadowOpacity: 0.6,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
              }}
            >
              <Heart size={19} color="#fff" fill="#fff" />
            </LinearGradient>
          </Animated.View>
          <View
            className="overflow-hidden rounded-full"
            style={{ borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)' }}
          >
            <Avatar source={conversation?.partnerAvatarUrl ?? undefined} seed={matchName} size={96} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500).duration(500)}>
          <Text className="mt-8 text-center font-body text-[14px] leading-[22px] text-white/50">
            Toi et <Text className="font-body-semibold text-white/85">{matchName || 'ce profil'}</Text> vous êtes plu.
            {'\n'}Lancez la conversation.
          </Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(650).springify().damping(15)} className="px-7 pb-12">
        <GradientButton
          label={matchName ? `Dis bonjour à ${matchName}` : 'Envoyer un message'}
          icon={<MessageCircle size={16} color="#fff" />}
          iconPosition="left"
          onPress={openChat}
          style={{ marginBottom: 12 }}
        />
        <GhostButton label="Continuer à découvrir" tone="onDark" onPress={() => router.replace('/(tabs)/discover')} />
      </Animated.View>
    </View>
  );
}
