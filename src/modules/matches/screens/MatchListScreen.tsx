import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search as SearchIcon, Heart, Star, BadgeCheck, Lock, Bookmark } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { Avatar } from '@/shared/components/ui/Avatar';
import { PhotoPlaceholder } from '@/shared/components/ui/PhotoPlaceholder';
import { EmptyState } from '@/shared/components/feedback';
import { useConversationsQuery } from '@/modules/messaging/hooks/useMessaging';
import { isRecentlyOnline } from '@/modules/messaging/types/messaging';
import { useEntitlements, useFavorites, useLikers, useToggleFavorite } from '@/modules/premium/hooks/usePremium';
import { colors, gradients } from '@/shared/constants/theme';

// Deux onglets seulement : les matchs (qui intègrent le teaser « Ils t'ont
// liké » sous forme de grille floutée) et les favoris. Le flou EST le hook
// premium : taper un profil verrouillé mène au paiement.
type MatchesTab = 'matches' | 'favorites';

export function MatchListScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<MatchesTab>('matches');
  const conversationsQuery = useConversationsQuery();
  const entitlements = useEntitlements();
  const isPremium = entitlements.data?.isPremium ?? false;
  const likersCount = entitlements.data?.likersCount ?? 0;
  const likersQuery = useLikers(isPremium);
  const favoritesQuery = useFavorites();
  const removeFavorite = useToggleFavorite();

  const matches = conversationsQuery.data ?? [];
  const newMatchesCount = matches.filter((m) => !m.lastMessage).length;
  const likers = likersQuery.data ?? [];
  // Favoris = profils sauvegardés (premium only). Vide pour les non-premium.
  const favorites = favoritesQuery.data ?? [];

  const TABS: { key: MatchesTab; label: string }[] = [
    { key: 'matches', label: `Matchs${matches.length > 0 ? ` (${matches.length})` : ''}` },
    { key: 'favorites', label: `Favoris${favorites.length > 0 ? ` (${favorites.length})` : ''}` },
  ];

  const goPremium = () => router.push('/premium/pricing');

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={230} color="rgba(106,79,192,0.09)" top={-50} right={-50} duration={9500} />
      </ScreenBackground>

      <View className="px-[22px]" style={{ paddingTop: 64 }}>
        <View className="mb-[18px] flex-row items-center justify-between">
          <Text className="font-display text-[30px] text-ink">Mes Matches</Text>
          {newMatchesCount > 0 ? (
            <View className="rounded-full bg-brand/10 px-3 py-1.5">
              <Text className="font-heading text-[11.5px] text-brand">{newMatchesCount} nouveaux</Text>
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

        {/* Onglets Matchs / Favoris */}
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
                  <Text className="text-center font-heading text-[11px] text-white" numberOfLines={1}>
                    {item.label}
                  </Text>
                </LinearGradient>
              ) : (
                <View className="py-[9px]">
                  <Text className="text-center font-heading text-[11px] text-ink/45" numberOfLines={1}>
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
        /* ── Onglet Matchs : matchs réels + teaser « Ils t'ont liké » ──── */
        matches.length === 0 && likersCount === 0 ? (
          <View className="px-[22px] pb-4">
            <EmptyState
              title="Pas encore de match"
              description="Continuez à explorer pour trouver vos premiers matches."
              actionLabel="Découvrir des profils"
              onAction={() => router.push('/(tabs)/discover')}
            />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-[22px] pb-32">
            {/* Matchs confirmés */}
            {matches.length > 0 ? (
              <>
                <Text className="mb-3 font-heading text-[13px] text-ink/60">Tes matchs</Text>
                {matches.map((item, index) => (
                  <Animated.View
                    key={item.matchId}
                    entering={FadeInDown.delay(Math.min(index, 10) * 45).springify().damping(17)}
                  >
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
                          <Text className="font-heading text-[13.5px] text-ink">{item.partnerFirstName}</Text>
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
                ))}
              </>
            ) : null}

            {/* Ils t'ont liké — flouté pour les non-premium (tap → paiement) */}
            {likersCount > 0 ? (
              <View className="mt-6">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="font-heading text-[13px] text-ink/60">Ils t'ont liké</Text>
                  <View className="rounded-full bg-brand/10 px-2.5 py-1">
                    <Text className="font-heading text-[10.5px] text-brand">{likersCount}</Text>
                  </View>
                </View>

                {isPremium ? (
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
                            <Text className="font-heading text-[13px] text-white" numberOfLines={1}>
                              {liker.firstName}
                            </Text>
                            {liker.isVerified ? <BadgeCheck size={12} color={colors.gold.DEFAULT} strokeWidth={2.6} /> : null}
                          </View>
                        </Pressable>
                      </Animated.View>
                    ))}
                  </View>
                ) : (
                  <>
                    {/* Chaque carte verrouillée mène au paiement. */}
                    <View className="flex-row flex-wrap justify-between">
                      {Array.from({ length: Math.min(likersCount, 6) }).map((_, index) => (
                        <Animated.View
                          key={index}
                          entering={FadeInDown.delay(Math.min(index, 8) * 50).springify().damping(16)}
                          style={{ width: '48.2%', marginBottom: 12 }}
                        >
                          <Pressable onPress={goPremium} className="active:opacity-90">
                            <View className="overflow-hidden rounded-3xl border border-white/80" style={{ aspectRatio: 0.8 }}>
                              <PhotoPlaceholder seed={index + 3} style={{ flex: 1 }} />
                              <BlurView intensity={55} tint="light" style={{ position: 'absolute', inset: 0 }} />
                              <View className="absolute inset-0 items-center justify-center bg-white/[0.12]">
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/70">
                                  <Lock size={16} color={colors.brand.DEFAULT} strokeWidth={2.2} />
                                </View>
                              </View>
                            </View>
                          </Pressable>
                        </Animated.View>
                      ))}
                    </View>

                    <Pressable onPress={goPremium} className="mt-1 active:opacity-90">
                      <LinearGradient
                        colors={gradients.brand}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 999, paddingVertical: 13 }}
                      >
                        <Text className="text-center font-heading text-[12.5px] tracking-wide text-white">
                          {likersCount} personne{likersCount > 1 ? 's' : ''} craque
                          {likersCount > 1 ? 'nt' : ''} pour toi — Voir avec Premium
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </>
                )}
              </View>
            ) : null}
          </ScrollView>
        )
      ) : !isPremium ? (
        /* ── Onglet Favoris : réservé aux abonnés premium ───────────── */
        <View className="flex-1 px-[22px]">
          <View className="items-center rounded-3xl border-[1.5px] border-white/90 bg-white/70 px-6 py-10">
            <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-brand/10">
              <Bookmark size={28} color={colors.brand.DEFAULT} strokeWidth={1.8} />
            </View>
            <Text className="mb-2 text-center font-display text-[22px] text-ink">Les favoris sont Premium</Text>
            <Text className="mb-6 text-center font-body text-[13px] leading-[20px] text-ink-muted">
              Mets des profils de côté depuis Découvrir et retrouve-les ici. Réservé aux abonnés Premium.
            </Text>
            <Pressable onPress={goPremium} className="w-full active:opacity-90">
              <LinearGradient
                colors={gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 999, paddingVertical: 14 }}
              >
                <Text className="text-center font-heading text-[12.5px] tracking-wide text-white">
                  Passer à Premium
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      ) : (
        /* ── Onglet Favoris (premium) : profils sauvegardés ─────────── */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-[22px] pb-32">
          {favoritesQuery.isLoading ? (
            <ActivityIndicator color={colors.brand.DEFAULT} style={{ marginTop: 12 }} />
          ) : favorites.length === 0 ? (
            <EmptyState
              icon={<Bookmark size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
              title="Aucun favori"
              description="Enregistre des profils depuis Découvrir avec le bouton favori pour les retrouver ici."
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
                      <Text className="font-heading text-[13.5px] text-ink">{favorite.firstName}</Text>
                      {favorite.isVerified ? (
                        <BadgeCheck size={11} color={colors.gold.DEFAULT} strokeWidth={2.7} />
                      ) : null}
                    </View>
                    {favorite.city ? (
                      <Text className="font-body text-[11.5px] text-ink-muted">{favorite.city}</Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => removeFavorite.mutate({ targetId: favorite.id, isFavorited: true })}
                    hitSlop={10}
                    className="h-9 w-9 items-center justify-center rounded-full bg-brand/[0.08] active:opacity-70"
                  >
                    <Bookmark size={16} color={colors.brand.DEFAULT} fill={colors.brand.DEFAULT} strokeWidth={2} />
                  </Pressable>
                </Pressable>
              </Animated.View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
