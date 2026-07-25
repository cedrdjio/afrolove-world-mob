import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SlidersHorizontal, Bell, Sun, Moon } from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/layout';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useAppError } from '@/shared/hooks/useAppError';
import { colors } from '@/shared/constants/theme';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { useThemeStore } from '@/shared/theme/themeStore';
import { useSwipe } from '@/modules/discovery/hooks/useDiscovery';
import { discoveryService } from '@/modules/discovery/services/discoveryService';
import { useFiltersStore } from '@/modules/discovery/stores/filtersStore';
import { useEntitlements } from '@/modules/premium/hooks/usePremium';
import { useHasUnreadNotifications } from '@/modules/notifications/hooks/useNotifications';
import type { DiscoveryProfile, SwipeAction } from '@/modules/discovery/types/discovery';
import { SwipeCard, type SwipeDirection } from '@/modules/discovery/components/SwipeCard';
import { ActionButtons } from '@/modules/discovery/components/ActionButtons';
import { NoProfilesState } from '@/modules/discovery/screens/NoProfilesScreen';
import { usePresenceStore } from '@/shared/stores/presenceStore';
import { isRecentlyOnline } from '@/modules/messaging/types/messaging';
import { useFavoriteIds, useToggleFavorite } from '@/modules/favorites/hooks/useSavedFavorites';
import { useDeckStore } from '@/modules/discovery/stores/deckStore';

// Deux onglets façon maquette : « Pour toi » = flux recommandé tel quel ;
// « À proximité » = le même flux, trié par distance croissante côté client.
type DiscoveryTab = 'foryou' | 'nearby';
const TABS: { key: DiscoveryTab; label: string }[] = [
  { key: 'foryou', label: 'Pour toi' },
  { key: 'nearby', label: 'À proximité' },
];

const DIRECTION_TO_ACTION: Record<SwipeDirection, SwipeAction> = {
  left: 'pass',
  right: 'like',
};

export function SwipeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<DiscoveryTab>('foryou');
  const [commandedDirection, setCommandedDirection] = useState<SwipeDirection | null>(null);
  const swipe = useSwipe();
  const hasUnreadNotifications = useHasUnreadNotifications();
  const entitlements = useEntitlements();
  const onlineIds = usePresenceStore((s) => s.onlineIds);
  const c = useThemeColors();
  const setThemePref = useThemeStore((s) => s.setPref);

  // Filtres actifs → signature du deck + fonction de chargement. Le deck
  // lui-même vit dans le deckStore : revenir sur cet écran ne recharge rien.
  const scope = useFiltersStore((s) => s.scope);
  const country = useFiltersStore((s) => s.country);
  const ageMin = useFiltersStore((s) => s.ageMin);
  const ageMax = useFiltersStore((s) => s.ageMax);
  const verifiedOnly = useFiltersStore((s) => s.verifiedOnly);
  const interestIds = useFiltersStore((s) => s.interestIds);
  const deckKey = JSON.stringify({ scope, country, ageMin, ageMax, verifiedOnly, interestIds });
  const fetchDeck = useCallback(
    () =>
      discoveryService.searchProfiles({ ageMin, ageMax, scope, country, verifiedOnly, mode: 'all', interestIds }),
    [ageMin, ageMax, scope, country, verifiedOnly, interestIds],
  );

  const deckProfiles = useDeckStore((s) => s.profiles);
  const consumedIds = useDeckStore((s) => s.consumedIds);
  const deckStatus = useDeckStore((s) => s.status);
  const deckError = useDeckStore((s) => s.error);
  const deckExhaustedFlag = useDeckStore((s) => s.exhausted);
  const loadInitial = useDeckStore((s) => s.loadInitial);
  const refillDeck = useDeckStore((s) => s.refill);
  const consume = useDeckStore((s) => s.consume);
  const resetDeck = useDeckStore((s) => s.reset);

  useEffect(() => {
    loadInitial(deckKey, fetchDeck);
  }, [deckKey, fetchDeck, loadInitial]);

  // « À proximité » réordonne le deck par distance (profils sans distance en
  // dernier). « Pour toi » garde l'ordre recommandé du serveur. Les profils
  // déjà traités sont retirés — c'est ce qui fait avancer le deck.
  const profiles = useMemo(() => {
    const list = deckProfiles.filter((p) => !consumedIds.has(p.id));
    if (tab !== 'nearby') return list;
    return [...list].sort((a, b) => {
      const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
      const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
      return da - db;
    });
  }, [deckProfiles, tab, consumedIds]);

  // Pagination intelligente : quand il reste peu de cartes, la page suivante
  // s'AJOUTE en arrière-plan (profils swipés exclus côté serveur) — jamais de
  // rechargement visible.
  useEffect(() => {
    if (profiles.length < 4 && deckStatus === 'idle' && !deckExhaustedFlag) {
      refillDeck(fetchDeck);
    }
  }, [profiles.length, deckStatus, deckExhaustedFlag, refillDeck, fetchDeck]);

  // Compteur de swipes restants pour les comptes sans forfait (null = illimité).
  const swipesLimit = entitlements.data?.swipesLimit ?? null;
  const swipesRemaining =
    swipesLimit == null ? null : Math.max(0, swipesLimit - (entitlements.data?.swipesUsedToday ?? 0));

  useEffect(() => {
    setCommandedDirection(null);
  }, [deckKey, tab]);

  const visibleCards = profiles.slice(0, 3);
  const isLoadingDeck = deckStatus === 'loading';
  const isRefilling = deckStatus === 'refilling' && profiles.length === 0;
  const isEmpty = deckExhaustedFlag && profiles.length === 0 && deckStatus === 'idle';
  const feedError = useAppError(deckStatus === 'error' ? deckError : null);
  const retryDeck = () => {
    resetDeck();
    loadInitial(deckKey, fetchDeck);
  };

  const handleSwiped = (direction: SwipeDirection, profile: DiscoveryProfile) => {
    consume(profile.id);
    setCommandedDirection(null);
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
          } else if (swipesRemaining != null && swipesRemaining <= 1) {
            // Dernier swipe gratuit consommé : proposer un forfait tout de suite.
            router.push({ pathname: '/discover-like-limit', params: { reason: 'swipes' } });
          }
        },
        onError: (error) => {
          // Free-tier limits are enforced by the DB swipe trigger — the raised
          // exception codes arrive in the error message.
          const message = error instanceof Error ? error.message : '';
          if (message.includes('SWIPE_LIMIT_REACHED') || message.includes('LIKE_LIMIT_REACHED')) {
            router.push({ pathname: '/discover-like-limit', params: { reason: 'swipes' } });
          } else if (message.includes('FAVORITES_LIMIT_REACHED')) {
            router.push({ pathname: '/discover-like-limit', params: { reason: 'favorites' } });
          } else if (message.includes('SUPER_LIKE_PREMIUM_ONLY') || message.includes('SUPER_LIKE_LIMIT_REACHED')) {
            router.push('/premium');
          }
        },
      },
    );
  };

  const topProfile = visibleCards[0];
  // The buttons don't advance the deck directly: they command the top card,
  // which plays its exit animation then reports back through onSwiped —
  // exactly the same path as a finger swipe.
  const triggerSwipe = (direction: SwipeDirection) => {
    if (topProfile && !commandedDirection) setCommandedDirection(direction);
  };

  // Signet : garde le profil dans Mes Matches → Favoris ET compte comme un
  // like — la carte part à droite (même animation qu'un like) et handleSwiped
  // enregistre le like. Deux effets : 1) profil liké, 2) profil en favoris.
  const favoriteIds = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const topIsFavorite = topProfile ? favoriteIds.has(topProfile.id) : false;
  const handleToggleFavorite = () => {
    if (!topProfile || toggleFavorite.isPending) return;
    toggleFavorite.mutate({ targetId: topProfile.id, isFavorite: topIsFavorite });
    if (!topIsFavorite) triggerSwipe('right');
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream" />

      <View
        className="flex-row items-center justify-between px-5"
        style={{ paddingTop: Math.max(insets.top, 24) + 12 }}
      >
        <View className="flex-row items-center gap-2.5">
          <Pressable onPress={() => router.push('/discover-filters')}>
            <GlassSurface variant="light" radius={15} style={{ width: 44, height: 44 }}>
              <View className="h-11 w-11 items-center justify-center">
                <SlidersHorizontal size={17} color={c.ink.DEFAULT} />
              </View>
            </GlassSurface>
          </Pressable>
          {/* Bascule clair / sombre — juste à côté du filtre. Un appui force le
              thème opposé au thème courant ; par défaut l'app suit le système. */}
          <Pressable
            onPress={() => setThemePref(c.isDark ? 'light' : 'dark')}
            accessibilityLabel={c.isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            <GlassSurface variant="light" radius={15} style={{ width: 44, height: 44 }}>
              <View className="h-11 w-11 items-center justify-center">
                {c.isDark ? (
                  <Sun size={18} color={colors.gold.DEFAULT} />
                ) : (
                  <Moon size={17} color={c.ink.DEFAULT} />
                )}
              </View>
            </GlassSurface>
          </Pressable>
        </View>
        <Text className="font-display text-[22px] tracking-wide text-ink">Découvrir</Text>
        <Pressable onPress={() => router.push('/notifications')}>
          <GlassSurface variant="light" radius={15} style={{ width: 44, height: 44 }}>
            <View className="h-11 w-11 items-center justify-center">
              <Bell size={18} color={c.ink.DEFAULT} />
              {hasUnreadNotifications ? (
                <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-cream bg-brand" />
              ) : null}
            </View>
          </GlassSurface>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-3 px-5 pt-6">
        {/* Sélecteur à 2 onglets « Pour toi / À proximité » façon maquette. */}
        <View className="flex-row rounded-full border border-brand/15 bg-surface/60 p-1">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setTab(t.key);
                }}
                className={`rounded-full px-4 py-2 ${active ? 'bg-brand' : ''}`}
              >
                <Text
                  className={`font-heading text-[12.5px] ${active ? 'text-white' : 'text-ink-muted'}`}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {swipesRemaining != null ? (
          <Pressable
            onPress={() => router.push('/premium/pricing')}
            className={`ml-auto rounded-full border px-3 py-1.5 ${
              c.isDark ? 'border-white/15 bg-white/[0.08]' : 'border-brand/20 bg-brand/[0.08]'
            }`}
          >
            <Text className={`font-heading text-[10.5px] uppercase ${c.isDark ? 'text-gold' : 'text-brand'}`}>
              {swipesRemaining} swipe{swipesRemaining > 1 ? 's' : ''}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="mx-3 mt-5 flex-1" style={{ marginBottom: 160 }}>
        {isLoadingDeck || isRefilling ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            className="flex-1 items-center justify-center rounded-[28px] border-[1.5px] border-surface-border/80 bg-surface/50"
          >
            <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
            <Text className="mt-4 font-body text-[13px] text-ink-muted">Recherche de profils…</Text>
          </Animated.View>
        ) : feedError ? (
          <View className="flex-1 justify-center px-4">
            <ErrorState error={feedError} variant="inline" onRetry={retryDeck} />
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
                commandedDirection={i === 0 ? commandedDirection : null}
                isOnline={onlineIds.has(profile.id) || isRecentlyOnline(profile.lastActiveAt)}
                onSwiped={(direction) => handleSwiped(direction, profile)}
                onTap={() => router.push(`/profile/${profile.id}`)}
              />
            ))
            .reverse()
        )}
      </View>

      {!isEmpty && !isLoadingDeck && !isRefilling && !feedError ? (
        // Barre d'actions sur fond de verre qui épouse la largeur de la carte
        // (mêmes marges) — la continuité visuelle carte → boutons, sans photo
        // derrière les boutons.
        <View className="absolute inset-x-3" style={{ bottom: 92 }}>
          <GlassSurface variant="light" radius={26}>
            <View className="py-2.5">
              <ActionButtons
                onNope={() => triggerSwipe('left')}
                onLike={() => triggerSwipe('right')}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={topIsFavorite}
              />
            </View>
          </GlassSurface>
        </View>
      ) : null}
    </View>
  );
}
