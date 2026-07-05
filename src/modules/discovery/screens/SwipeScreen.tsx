import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SlidersHorizontal, Bell } from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/layout';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { Chip } from '@/shared/components/ui/Chip';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useAppError } from '@/shared/hooks/useAppError';
import { colors } from '@/shared/constants/theme';
import { useDiscoveryFeed, useSwipe } from '@/modules/discovery/hooks/useDiscovery';
import { useHasUnreadNotifications } from '@/modules/notifications/hooks/useNotifications';
import type { DiscoveryFeedMode, DiscoveryProfile, SwipeAction } from '@/modules/discovery/types/discovery';
import { SwipeCard, type SwipeDirection } from '@/modules/discovery/components/SwipeCard';
import { ActionButtons } from '@/modules/discovery/components/ActionButtons';
import { NoProfilesState } from '@/modules/discovery/screens/NoProfilesScreen';

const FEED_MODES: { key: DiscoveryFeedMode; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'new', label: 'Nouveaux' },
  { key: 'online', label: 'En ligne' },
];

const DIRECTION_TO_ACTION: Record<SwipeDirection, SwipeAction> = {
  left: 'pass',
  right: 'like',
  up: 'super_like',
};

export function SwipeScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<DiscoveryFeedMode>('all');
  const [deckIndex, setDeckIndex] = useState(0);
  const feed = useDiscoveryFeed(mode);
  const swipe = useSwipe();
  const feedError = useAppError(feed.error);
  const hasUnreadNotifications = useHasUnreadNotifications();

  const profiles = feed.data ?? [];

  // A new deck (filters changed, chip changed, refetch) restarts at the top.
  useEffect(() => {
    setDeckIndex(0);
  }, [feed.dataUpdatedAt]);

  const visibleCards = profiles.slice(deckIndex, deckIndex + 3);
  const isEmpty = !feed.isLoading && deckIndex >= profiles.length;

  const handleSwiped = (direction: SwipeDirection, profile: DiscoveryProfile) => {
    setDeckIndex((i) => i + 1);
    swipe.mutate(
      { targetId: profile.id, action: DIRECTION_TO_ACTION[direction] },
      {
        onSuccess: ({ isMatch }) => {
          if (isMatch) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            router.push({
              pathname: '/matches/celebration',
              params: { id: profile.id, name: profile.firstName },
            });
          }
        },
        onError: (error) => {
          // Free-tier limits are enforced by the DB swipe trigger — the raised
          // exception codes arrive in the error message.
          const message = error instanceof Error ? error.message : '';
          if (message.includes('LIKE_LIMIT_REACHED')) {
            router.push('/discover-like-limit');
          } else if (message.includes('SUPER_LIKE_PREMIUM_ONLY') || message.includes('SUPER_LIKE_LIMIT_REACHED')) {
            router.push('/premium');
          }
        },
      },
    );
  };

  const topProfile = visibleCards[0];
  const triggerSwipe = (direction: SwipeDirection) => {
    if (topProfile) handleSwiped(direction, topProfile);
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream" />

      <View className="flex-row items-center justify-between px-5 pt-16">
        <Pressable onPress={() => router.push('/discover-filters')}>
          <GlassSurface variant="light" radius={15} style={{ width: 44, height: 44 }}>
            <View className="h-11 w-11 items-center justify-center gap-1">
              <SlidersHorizontal size={17} color={colors.ink.DEFAULT} />
            </View>
          </GlassSurface>
        </Pressable>
        <Text className="font-display text-[22px] tracking-wide text-ink">Découvrir</Text>
        <Pressable onPress={() => router.push('/notifications')}>
          <GlassSurface variant="light" radius={15} style={{ width: 44, height: 44 }}>
            <View className="h-11 w-11 items-center justify-center">
              <Bell size={18} color={colors.ink.DEFAULT} />
              {hasUnreadNotifications ? (
                <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-cream bg-brand" />
              ) : null}
            </View>
          </GlassSurface>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2.5 px-5 pt-6">
        {FEED_MODES.map((feedMode) => (
          <Chip
            key={feedMode.key}
            label={feedMode.label}
            selected={mode === feedMode.key}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setMode(feedMode.key);
            }}
          />
        ))}
      </View>

      <View className="mx-[18px] mt-6 flex-1" style={{ marginBottom: 210 }}>
        {feed.isLoading ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            className="flex-1 items-center justify-center rounded-[28px] border-[1.5px] border-white/80 bg-white/50"
          >
            <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
            <Text className="mt-4 font-body text-[13px] text-ink-muted">Recherche de profils…</Text>
          </Animated.View>
        ) : feedError ? (
          <View className="flex-1 justify-center px-4">
            <ErrorState error={feedError} variant="inline" onRetry={() => feed.refetch()} />
          </View>
        ) : isEmpty ? (
          <Animated.View entering={FadeInDown} className="flex-1">
            <NoProfilesState onOpenFilters={() => router.push('/discover-filters')} />
          </Animated.View>
        ) : (
          visibleCards
            .map((profile, i) => (
              <SwipeCard
                key={profile.id}
                profile={profile}
                isTop={i === 0}
                stackIndex={i}
                onSwiped={(direction) => handleSwiped(direction, profile)}
                onTap={() => router.push(`/profile/${profile.id}`)}
              />
            ))
            .reverse()
        )}
      </View>

      {!isEmpty && !feed.isLoading && !feedError ? (
        <View className="absolute inset-x-0" style={{ bottom: 118 }}>
          <ActionButtons
            onNope={() => triggerSwipe('left')}
            onSuperLike={() => triggerSwipe('up')}
            onLike={() => triggerSwipe('right')}
            onBoost={() => router.push('/premium')}
          />
        </View>
      ) : null}
    </View>
  );
}
