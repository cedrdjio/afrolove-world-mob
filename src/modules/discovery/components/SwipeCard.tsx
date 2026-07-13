import { useCallback, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Heart, BadgeCheck, ShieldQuestion } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PhotoPlaceholder } from '@/shared/components/ui/PhotoPlaceholder';
import { colors } from '@/shared/constants/theme';
import { formatLastSeen } from '@/shared/utils/lastSeen';
import type { DiscoveryProfile } from '@/modules/discovery/types/discovery';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

export type SwipeDirection = 'left' | 'right' | 'up';

interface SwipeCardProps {
  profile: DiscoveryProfile;
  onSwiped: (direction: SwipeDirection) => void;
  onTap: () => void;
  isTop: boolean;
  stackIndex: number;
  /** Renseigné quand un bouton d'action déclenche le swipe : la carte joue
   *  la même animation de sortie qu'un geste avant de notifier onSwiped. */
  commandedDirection?: SwipeDirection | null;
  /** Présence Realtime — affiche la pastille « En ligne » sur la carte. */
  isOnline?: boolean;
}

export function SwipeCard({
  profile,
  onSwiped,
  onTap,
  isTop,
  stackIndex,
  commandedDirection = null,
  isOnline = false,
}: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // Springs toward its slot so a card sliding from the stack to the top
  // visibly "wakes up" instead of snapping — this is what makes the deck
  // feel fluid after every swipe.
  const stackProgress = useSharedValue(stackIndex);
  const crossedThreshold = useSharedValue(false);
  const isLeaving = useSharedValue(false);

  useEffect(() => {
    stackProgress.value = withSpring(stackIndex, { damping: 18, stiffness: 160, overshootClamping: true });
  }, [stackIndex, stackProgress]);

  const finishSwipe = useCallback(
    (direction: SwipeDirection) => {
      onSwiped(direction);
    },
    [onSwiped],
  );

  const thresholdHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  // The deck only advances once the exit animation has finished — advancing
  // immediately unmounted the card mid-flight, making every swipe look like
  // an abrupt teleport instead of a throw.
  const animateOut = useCallback(
    (direction: SwipeDirection) => {
      'worklet';
      if (isLeaving.value) return;
      isLeaving.value = true;
      const done = (finished?: boolean) => {
        'worklet';
        if (finished) runOnJS(finishSwipe)(direction);
      };
      if (direction === 'up') {
        translateY.value = withTiming(-900, { duration: 260 }, done);
      } else if (direction === 'right') {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 260 }, done);
      } else {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 260 }, done);
      }
    },
    [finishSwipe, isLeaving, translateX, translateY],
  );

  // Action-bar buttons (Nope / Super / Like) command the same exit animation
  // as a finger swipe, so both paths look and behave identically.
  useEffect(() => {
    if (isTop && commandedDirection) {
      animateOut(commandedDirection);
    }
  }, [isTop, commandedDirection, animateOut]);

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((event) => {
      if (isLeaving.value) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      // One gentle tick exactly when the card becomes "droppable".
      const beyond =
        Math.abs(event.translationX) > SWIPE_THRESHOLD || event.translationY < -SWIPE_THRESHOLD;
      if (beyond && !crossedThreshold.value) {
        crossedThreshold.value = true;
        runOnJS(thresholdHaptic)();
      } else if (!beyond && crossedThreshold.value) {
        crossedThreshold.value = false;
      }
    })
    .onEnd((event) => {
      if (isLeaving.value) return;
      crossedThreshold.value = false;
      const goingUp = event.translationY < -SWIPE_THRESHOLD && Math.abs(event.translationX) < SWIPE_THRESHOLD;
      const goingRight = event.translationX > SWIPE_THRESHOLD;
      const goingLeft = event.translationX < -SWIPE_THRESHOLD;

      if (goingUp) {
        animateOut('up');
      } else if (goingRight) {
        animateOut('right');
      } else if (goingLeft) {
        animateOut('left');
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 180, overshootClamping: true });
        translateY.value = withSpring(0, { damping: 18, stiffness: 180, overshootClamping: true });
      }
    });

  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(onTap)();
  });

  const composed = Gesture.Simultaneous(pan, tap);

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-12, 0, 12], Extrapolation.CLAMP);
    const stackScale = 1 - stackProgress.value * 0.04;
    const stackTranslateY = stackProgress.value * 8;

    return {
      transform: [
        { translateX: isTop ? translateX.value : 0 },
        { translateY: (isTop ? translateY.value : 0) + stackTranslateY },
        { rotate: isTop ? `${rotate}deg` : '0deg' },
        { scale: stackScale },
      ],
    };
  });

  const likeStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0.7, 1], Extrapolation.CLAMP) },
      { rotate: '-12deg' },
    ],
  }));
  const nopeStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0.7], Extrapolation.CLAMP) },
      { rotate: '12deg' },
    ],
  }));
  const superStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateY.value, [-SWIPE_THRESHOLD, 0], [1, 0.7], Extrapolation.CLAMP) }],
  }));

  const locationLine = [
    [profile.city, profile.country].filter(Boolean).join(', '),
    profile.distanceKm != null ? `${profile.distanceKm} km` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  // Hors présence temps réel, on montre la dernière activité connue.
  const lastSeenLabel = isOnline ? null : formatLastSeen(profile.lastActiveAt);

  const cardContent = (
    <Animated.View
      style={[
        { position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden' },
        { shadowColor: '#3D3552', shadowOpacity: 0.28, shadowRadius: 30, shadowOffset: { width: 0, height: 14 } },
        cardStyle,
      ]}
    >
      {profile.avatarUrl ? (
        <Image
          source={{ uri: profile.avatarUrl }}
          style={{ position: 'absolute', inset: 0 }}
          contentFit="cover"
          transition={220}
        />
      ) : (
        <PhotoPlaceholder seed={profile.id.charCodeAt(0)} style={{ position: 'absolute', inset: 0 }} showIcon iconSize={40} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(24,15,42,0.92)']}
        locations={[0.38, 1]}
        style={{ position: 'absolute', inset: 0 }}
      />

      {isTop ? (
        <>
          <Animated.View
            style={[{ position: 'absolute', top: 20, left: 20 }, likeStampStyle]}
            className="rounded-lg border-4 border-brand px-3 py-1"
          >
            <Text className="font-display-black text-[24px] text-brand">Like</Text>
          </Animated.View>
          <Animated.View
            style={[{ position: 'absolute', top: 20, right: 20 }, nopeStampStyle]}
            className="rounded-lg border-4 border-ink-muted px-3 py-1"
          >
            <Text className="font-display-black text-[24px] text-ink-muted">Nope</Text>
          </Animated.View>
          <Animated.View
            style={[{ position: 'absolute', top: 20, alignSelf: 'center' }, superStampStyle]}
            className="rounded-lg border-4 border-gold px-3 py-1"
          >
            <Text className="font-display-black text-[24px] text-gold">Super</Text>
          </Animated.View>
        </>
      ) : null}

      <View className="absolute left-3.5 top-3.5 flex-row items-center gap-1.5 rounded-full border border-white/95 bg-white/[0.88] px-3 py-1.5">
        <Heart size={11} color={colors.brand.DEFAULT} fill={colors.brand.DEFAULT} />
        <Text className="font-heading text-[11px] text-ink">{profile.compatibility}% Match</Text>
      </View>
      {/* Statut de vérification toujours visible — le badge « Non vérifié »
          informe autant que le « Vérifié » (confiance avant le match). */}
      {profile.isVerified ? (
        <View className="absolute right-3.5 top-3.5 flex-row items-center gap-1 rounded-full border border-white/95 bg-white/[0.88] px-2.5 py-1.5">
          <BadgeCheck size={10} color={colors.gold.DEFAULT} strokeWidth={2.8} />
          <Text className="font-heading-semibold text-[10px] text-ink">Vérifié</Text>
        </View>
      ) : (
        <View className="absolute right-3.5 top-3.5 flex-row items-center gap-1 rounded-full border border-white/[0.25] bg-ink/[0.42] px-2.5 py-1.5">
          <ShieldQuestion size={10} color="rgba(255,255,255,0.85)" strokeWidth={2.4} />
          <Text className="font-heading-semibold text-[10px] text-white/85">Non vérifié</Text>
        </View>
      )}

      <View className="absolute inset-x-0 bottom-0 px-5 pb-[22px]">
        <View className="mb-1.5 flex-row items-baseline gap-2">
          <Text className="font-display text-[32px] text-white">{profile.firstName},</Text>
          <Text className="font-display-semibold text-[26px] text-white/80">{profile.age}</Text>
        </View>
        {isOnline ? (
          <View className="mb-1.5 flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-success" />
            <Text className="font-heading-semibold text-[11px] text-white/90">En ligne</Text>
          </View>
        ) : lastSeenLabel ? (
          <View className="mb-1.5 flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-white/35" />
            <Text className="font-body-medium text-[11px] text-white/60">{lastSeenLabel}</Text>
          </View>
        ) : null}
        {locationLine ? (
          <Text className="mb-3 font-body-medium text-[12.5px] text-white/75">{locationLine}</Text>
        ) : null}
        <View className="flex-row flex-wrap gap-1.5">
          {profile.interestNames.slice(0, 3).map((tag) => (
            <View key={tag} className="rounded-full border border-white/[0.22] bg-white/[0.15] px-3 py-1.5">
              <Text className="font-heading-semibold text-[11px] text-white">{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  if (!isTop) return cardContent;

  return <GestureDetector gesture={composed}>{cardContent}</GestureDetector>;
}
