import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search as SearchIcon, Heart, Star, BadgeCheck, Lock } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { Avatar } from '@/shared/components/ui/Avatar';
import { PhotoPlaceholder } from '@/shared/components/ui/PhotoPlaceholder';
import { EmptyState } from '@/shared/components/feedback';
import { useConversationsQuery } from '@/modules/messaging/hooks/useMessaging';
import { isRecentlyOnline } from '@/modules/messaging/types/messaging';
import { useEntitlements, useFavorites, useLikers } from '@/modules/premium/hooks/usePremium';
import { colors, gradients } from '@/shared/constants/theme';

type MatchesTab = 'matches' | 'likers' | 'favorites';

export function MatchListScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<MatchesTab>('matches');
  const conversationsQuery = useConversationsQuery();
  const entitlements = useEntitlements();
  const isPremium = entitlements.data?.isPremium ?? false;
  const likersCount = entitlements.data?.likersCount ?? 0;
  const favoritesLimit = entitlements.data?.favoritesLimit ?? null;
  const likersQuery = useLikers(isPremium);
  const favoritesQuery = useFavorites();

  const matches = conversationsQuery.data ?? [];
  const newMatchesCount = matches.filter((m) => !m.lastMessage).length;
  const likers = likersQuery.data ?? [];
  const favorites = (favoritesQuery.data ?? []).filter((f) => !f.isMatched);
  const favoritesFull = favoritesLimit != null && favorites.length >= favoritesLimit;

  const TABS: { key: MatchesTab; label: string }[] = [
    { key: 'matches', label: `Matchs${matches.length > 0 ? ` (${matches.length})` : ''}` },
    { key: 'likers', label: `Ils t'ont liké${likersCount > 0 ? ` (${likersCount})` : ''}` },
    { key: 'favorites', label: `Favoris${favorites.length > 0 ? ` (${favorites.length})` : ''}` },
  ];

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={230} color="rgba(106,79,192,0.09)" top={-50} right={-50} duration={9500} />
      </ScreenBackground>

      <View className="px-[22px]" style={{ paddingTop: 64 }}>
        <View className="mb-[18px] flex-row items-center justify-between">
          <Text className="font-display text-[30px] uppercase text-ink">Mes Matches</Text>
          {newMatchesCount > 0 ? (
            <View className="rounded-full bg-brand/10 px-3 py-1.5">
              <Text className="font-heading text-[11.5px] uppercase text-brand">{newMatchesCount} nouveaux</Text>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={() => router.push('/matches-search')}
          className="mb-4 flex-row items-center gap-2.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5"
        >
          <SearchIcon size={15} color="rgba(62,53,82,0.28)" />
          <Text className="font-body text-[13px] text-ink/30">Rechercher un match…</Text>
        </Pressable>

        {/* Onglets Matchs / Ils t'ont liké / Favoris */}
        <View className="mb-5 flex-row rounded-2xl border-[1.5px] border-white/90 bg-white/60 p-1">
          {TABS.map((item) => (
            <Pressable key={item.key} onPress={() => setTab(item.key)} className="flex-1">
              {tab === item.key ? (
                <LinearGradient
                  colors={gradients.brand}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 12, paddingVertical: 9 }}
                >
                  <Text className="text-center font-heading text-[10.5px] uppercase text-white" numberOfLines={1}>
                    {item.label}
                  </Text>
                </LinearGradient>
              ) : (
                <View className="py-[9px]">
                  <Text className="text-center font-heading text-[10.5px] uppercase text-ink/45" numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {conversationsQuery.isLoading || entitlements.isLoading ? (
        <View className="items-center pt-10">
          <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
        </View>
      ) : tab === 'matches' ? (
        /* ── Onglet Matchs ──────────────────────────────────────────── */
        matches.length === 0 ? (
          <View className="px-[22px] pb-4">
            <EmptyState
              title="Pas encore de match"
              description="Continuez à explorer pour trouver vos premiers matches."
              actionLabel="Découvrir des profils"
              onAction={() => router.push('/(tabs)/discover')}
            />
          </View>
        ) : (
          <FlashList
            data={matches}
            keyExtractor={(item) => item.matchId}
            contentContainerClassName="px-[22px] pb-32"
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(Math.min(index, 10) * 45).springify().damping(17)}>
                <Pressable
                  onPress={() => router.push(`/chat/${item.matchId}`)}
                  className="mb-2 flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3 active:opacity-85"
                >
                  <Avatar
                    source={item.partnerAvatarUrl ?? undefined}
                    seed={item.partnerFirstName}
                    size={52}
                    ringColor={isRecentlyOnline(item.partnerLastActiveAt) ? colors.success : colors.gold.DEFAULT}
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="font-heading text-[13.5px] uppercase text-ink">{item.partnerFirstName}</Text>
                      {item.partnerIsVerified ? (
                        <BadgeCheck size={11} color={colors.gold.DEFAULT} strokeWidth={2.7} />
                      ) : null}
                    </View>
                    <Text className="font-body text-[11.5px] text-ink-muted" numberOfLines={1}>
                      {item.lastMessage ?? 'Dites bonjour 👋'}
                    </Text>
                  </View>
                  {item.unreadCount > 0 ? (
                    <View className="h-6 min-w-6 items-center justify-center rounded-full bg-brand px-1.5">
                      <Text className="font-heading text-[10px] text-white">{item.unreadCount}</Text>
                    </View>
                  ) : null}
                </Pressable>
              </Animated.View>
            )}
          />
        )
      ) : tab === 'likers' ? (
        /* ── Onglet Ils t'ont liké (blocage si pas premium) ─────────── */
        likersCount === 0 ? (
          <View className="px-[22px]">
            <EmptyState
              icon={<Heart size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
              title="Pas encore de like reçu"
              description="Complétez votre profil et likez pour attirer l'attention."
              actionLabel="Découvrir des profils"
              onAction={() => router.push('/(tabs)/discover')}
            />
          </View>
        ) : isPremium ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-[22px] pb-32">
            <View className="flex-row flex-wrap justify-between">
              {likers.map((liker, index) => (
                <Animated.View
                  key={liker.id}
                  entering={FadeInDown.delay(Math.min(index, 8) * 55).springify().damping(16)}
                  style={{ width: '48.2%', marginBottom: 12 }}
                >
                  <Pressable
                    onPress={() => router.push(`/profile/${liker.id}`)}
                    className="overflow-hidden rounded-3xl border border-white/90 active:opacity-90"
                    style={{ aspectRatio: 0.8 }}
                  >
                    {liker.avatarUrl ? (
                      <Image source={{ uri: liker.avatarUrl }} style={{ flex: 1 }} contentFit="cover" transition={200} />
                    ) : (
                      <PhotoPlaceholder seed={index + 1} style={{ flex: 1 }} showIcon />
                    )}
                    <LinearGradient
                      colors={['transparent', 'rgba(24,15,42,0.85)']}
                      locations={[0.5, 1]}
                      style={{ position: 'absolute', inset: 0 }}
                    />
                    <View className="absolute right-2.5 top-2.5 h-8 w-8 items-center justify-center rounded-full bg-brand">
                      {liker.action === 'super_like' ? (
                        <Star size={14} color="#fff" fill="#fff" />
                      ) : (
                        <Heart size={14} color="#fff" fill="#fff" />
                      )}
                    </View>
                    <View className="absolute inset-x-3 bottom-3 flex-row items-center gap-1.5">
                      <Text className="font-heading text-[13px] uppercase text-white" numberOfLines={1}>
                        {liker.firstName}
                      </Text>
                      {liker.isVerified ? <BadgeCheck size={12} color={colors.gold.DEFAULT} strokeWidth={2.6} /> : null}
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        ) : (
          /* Non premium : grille floutée + cadenas, compteur réel, CTA. */
          <View className="flex-1">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-[22px] pb-44">
              <View className="flex-row flex-wrap justify-between">
                {Array.from({ length: Math.min(likersCount, 8) }).map((_, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInDown.delay(Math.min(index, 8) * 55).springify().damping(16)}
                    style={{ width: '48.2%', marginBottom: 12 }}
                  >
                    <View className="overflow-hidden rounded-3xl border border-white/80" style={{ aspectRatio: 0.8 }}>
                      <PhotoPlaceholder seed={index + 3} style={{ flex: 1 }} />
                      <BlurView intensity={55} tint="light" style={{ position: 'absolute', inset: 0 }} />
                      <View className="absolute inset-0 items-center justify-center bg-white/[0.12]">
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-white/70">
                          <Lock size={16} color={colors.brand.DEFAULT} strokeWidth={2.2} />
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </ScrollView>

            <View className="absolute inset-x-[22px] bottom-24 rounded-3xl border-[1.5px] border-white/90 bg-white/80 p-4">
              <Text className="mb-0.5 text-center font-heading text-[13px] uppercase text-ink">
                {likersCount} personne{likersCount > 1 ? 's' : ''} craque{likersCount > 1 ? 'nt' : ''} pour toi
              </Text>
              <Text className="mb-3 text-center font-body text-[11.5px] text-ink-muted">
                Débloque tous les likes avec Premium
              </Text>
              <Pressable onPress={() => router.push('/premium/pricing')} className="active:opacity-90">
                <LinearGradient
                  colors={gradients.brand}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 999, paddingVertical: 13 }}
                >
                  <Text className="text-center font-heading text-[12.5px] uppercase tracking-wide text-white">
                    Passer à Premium
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )
      ) : (
        /* ── Onglet Mes favoris ─────────────────────────────────────── */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-[22px] pb-32">
          {favoritesLimit != null ? (
            <View className="mb-3 flex-row items-center justify-between rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3">
              <Text className="font-body text-[12px] text-ink-muted">
                Favoris utilisés : {Math.min(favorites.length, favoritesLimit)}/{favoritesLimit}
              </Text>
              {favoritesFull ? (
                <Pressable onPress={() => router.push('/premium/pricing')} hitSlop={6}>
                  <Text className="font-heading text-[10.5px] uppercase text-brand">Passer illimité</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {favoritesFull ? (
            <Pressable onPress={() => router.push('/premium/pricing')} className="mb-3 active:opacity-90">
              <LinearGradient
                colors={gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 14 }}
              >
                <Text className="text-center font-heading text-[11.5px] uppercase text-white">
                  Limite de 10 favoris atteinte — passez à un forfait
                </Text>
              </LinearGradient>
            </Pressable>
          ) : null}

          {favoritesQuery.isLoading ? (
            <ActivityIndicator color={colors.brand.DEFAULT} style={{ marginTop: 12 }} />
          ) : favorites.length === 0 ? (
            <EmptyState
              icon={<Heart size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
              title="Aucun favori"
              description="Les profils que vous likez apparaîtront ici en attendant leur réponse."
              actionLabel="Découvrir des profils"
              onAction={() => router.push('/(tabs)/discover')}
            />
          ) : (
            favorites.map((favorite, index) => (
              <Animated.View
                key={favorite.id}
                entering={FadeInDown.delay(Math.min(index, 8) * 45).springify().damping(17)}
              >
                <Pressable
                  onPress={() => router.push(`/profile/${favorite.id}`)}
                  className="mb-2 flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3 active:opacity-85"
                >
                  <Avatar source={favorite.avatarUrl ?? undefined} seed={favorite.firstName} size={46} />
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="font-heading text-[13.5px] uppercase text-ink">{favorite.firstName}</Text>
                      {favorite.isVerified ? (
                        <BadgeCheck size={11} color={colors.gold.DEFAULT} strokeWidth={2.7} />
                      ) : null}
                    </View>
                    {favorite.city ? (
                      <Text className="font-body text-[11.5px] text-ink-muted">{favorite.city}</Text>
                    ) : null}
                  </View>
                  {favorite.action === 'super_like' ? (
                    <View className="flex-row items-center gap-1 rounded-full bg-gold/[0.12] px-2.5 py-1.5">
                      <Star size={10} color={colors.gold.DEFAULT} fill={colors.gold.DEFAULT} />
                      <Text className="font-heading text-[9px] uppercase text-gold">Super like</Text>
                    </View>
                  ) : (
                    <Heart size={15} color={colors.brand.DEFAULT} fill={colors.brand.DEFAULT} />
                  )}
                </Pressable>
              </Animated.View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
