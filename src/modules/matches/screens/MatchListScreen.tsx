import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search as SearchIcon, Heart, Star, BadgeCheck, Lock, ChevronRight, Crown } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { Avatar } from '@/shared/components/ui/Avatar';
import { PhotoPlaceholder } from '@/shared/components/ui/PhotoPlaceholder';
import { EmptyState } from '@/shared/components/feedback';
import { useConversationsQuery } from '@/modules/messaging/hooks/useMessaging';
import { isRecentlyOnline } from '@/modules/messaging/types/messaging';
import { useEntitlements, useFavorites, useLikers } from '@/modules/premium/hooks/usePremium';
import { colors, gradients } from '@/shared/constants/theme';

type MatchesTab = 'matches' | 'favorites';

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="mb-3 font-heading text-[11px] uppercase tracking-widest text-ink/40">{children}</Text>
  );
}

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
    { key: 'matches', label: 'Matchs' },
    { key: 'favorites', label: `Mes favoris${favorites.length > 0 ? ` (${favorites.length})` : ''}` },
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

        {/* Onglets Matchs / Mes favoris */}
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
                  <Text className="text-center font-heading text-[11.5px] uppercase text-white">{item.label}</Text>
                </LinearGradient>
              ) : (
                <View className="py-[9px]">
                  <Text className="text-center font-heading text-[11.5px] uppercase text-ink/45">{item.label}</Text>
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32">
          {matches.length === 0 ? (
            <View className="px-[22px] pb-4">
              <EmptyState
                title="Pas encore de match"
                description="Continuez à explorer pour trouver vos premiers matches."
                actionLabel="Découvrir des profils"
                onAction={() => router.push('/(tabs)/discover')}
              />
            </View>
          ) : (
            <View className="mb-6">
              <FlashList
                data={matches}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.matchId}
                contentContainerClassName="px-[22px]"
                renderItem={({ item, index }) => (
                  <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 60).springify().damping(16)}>
                    <Pressable
                      onPress={() => router.push(`/chat/${item.matchId}`)}
                      className="mr-3.5 items-center gap-1.5 active:opacity-80"
                      style={{ width: 62 }}
                    >
                      <Avatar
                        source={item.partnerAvatarUrl ?? undefined}
                        seed={item.partnerFirstName}
                        size={62}
                        ringColor={isRecentlyOnline(item.partnerLastActiveAt) ? colors.success : colors.gold.DEFAULT}
                      />
                      <Text className="font-heading text-[10px] uppercase text-ink" numberOfLines={1}>
                        {item.partnerFirstName}
                      </Text>
                    </Pressable>
                  </Animated.View>
                )}
              />
            </View>
          )}

          {/* Qui vous a aimé — la carte s'adapte à l'abonnement au lieu de
              redemander un forfait à un compte déjà premium. */}
          <View className="px-[22px]">
            <SectionTitle>Ils t'ont liké</SectionTitle>
            {isPremium && likers.length > 0 ? (
              <Pressable onPress={() => router.push('/likes')} className="mb-6 active:opacity-90">
                <View className="flex-row flex-wrap gap-2.5">
                  {likers.slice(0, 4).map((liker, index) => (
                    <Animated.View
                      key={liker.id}
                      entering={FadeInDown.delay(Math.min(index, 6) * 50).springify().damping(16)}
                    >
                      <View className="items-center gap-1.5" style={{ width: 72 }}>
                        <View>
                          <Avatar
                            source={liker.avatarUrl ?? undefined}
                            seed={liker.firstName}
                            size={72}
                            ringColor={liker.action === 'super_like' ? colors.gold.DEFAULT : colors.brand.DEFAULT}
                          />
                          {liker.action === 'super_like' ? (
                            <View className="absolute -bottom-0.5 -right-0.5 h-6 w-6 items-center justify-center rounded-full bg-gold">
                              <Star size={11} color="#fff" fill="#fff" />
                            </View>
                          ) : null}
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Text className="font-heading text-[10px] uppercase text-ink" numberOfLines={1}>
                            {liker.firstName}
                          </Text>
                          {liker.isVerified ? <BadgeCheck size={9} color={colors.gold.DEFAULT} strokeWidth={2.8} /> : null}
                        </View>
                      </View>
                    </Animated.View>
                  ))}
                </View>
                <View className="mt-3 flex-row items-center justify-center gap-1">
                  <Text className="font-heading text-[11px] uppercase text-brand">Voir tout</Text>
                  <ChevronRight size={12} color={colors.brand.DEFAULT} strokeWidth={2.4} />
                </View>
              </Pressable>
            ) : isPremium ? (
              <View className="mb-6 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-4">
                <View className="mb-1 flex-row items-center gap-2">
                  <Crown size={13} color={colors.gold.DEFAULT} strokeWidth={2.2} />
                  <Text className="font-heading text-[11px] uppercase text-gold">Premium actif</Text>
                </View>
                <Text className="font-body text-[12.5px] leading-[19px] text-ink-muted">
                  Personne ne vous a liké pour le moment — les nouveaux likes apparaîtront ici automatiquement.
                </Text>
              </View>
            ) : likersCount > 0 ? (
              /* Grille verrouillée façon maquette : des tuiles floutées, le
                 compteur réel, et le CTA vers l'écran « Ils t'ont liké ». */
              <Pressable onPress={() => router.push('/likes')} className="mb-6 active:opacity-95">
                <View className="flex-row flex-wrap gap-2">
                  {Array.from({ length: Math.min(likersCount, 6) }).map((_, index) => (
                    <Animated.View
                      key={index}
                      entering={FadeInDown.delay(index * 60).springify().damping(16)}
                      className="overflow-hidden rounded-2xl border border-white/80"
                      style={{ width: '31.5%', aspectRatio: 0.82 }}
                    >
                      <PhotoPlaceholder seed={index + 2} style={{ flex: 1 }} />
                      <BlurView intensity={55} tint="light" style={{ position: 'absolute', inset: 0 }} />
                      <View className="absolute inset-0 items-center justify-center bg-white/[0.12]">
                        <View className="h-9 w-9 items-center justify-center rounded-full bg-white/70">
                          <Lock size={15} color={colors.brand.DEFAULT} strokeWidth={2.2} />
                        </View>
                      </View>
                    </Animated.View>
                  ))}
                </View>
                <LinearGradient
                  colors={gradients.brand}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 999, paddingVertical: 13, marginTop: 12 }}
                >
                  <Text className="text-center font-heading text-[12.5px] uppercase tracking-wide text-white">
                    {likersCount} personne{likersCount > 1 ? 's' : ''} craque{likersCount > 1 ? 'nt' : ''} pour toi — Découvrir
                  </Text>
                </LinearGradient>
              </Pressable>
            ) : (
              <Pressable onPress={() => router.push('/likes')} className="mb-6 active:opacity-90">
                <LinearGradient
                  colors={gradients.brand}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 20, padding: 18 }}
                >
                  <View className="flex-row items-center gap-3.5">
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-white/[0.18]">
                      <Heart size={22} color="#fff" strokeWidth={1.9} />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-0.5 font-heading text-[14px] uppercase text-white">
                        Voyez qui vous a aimé
                      </Text>
                      <Text className="font-body text-[11.5px] text-white/70">
                        Passez Premium pour découvrir leurs profils.
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </ScrollView>
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
