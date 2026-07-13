import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search as SearchIcon, Star, BadgeCheck, Lock, ChevronRight, Bookmark } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { Avatar } from '@/shared/components/ui/Avatar';
import { EmptyState } from '@/shared/components/feedback';
import { useConversationsQuery } from '@/modules/messaging/hooks/useMessaging';
import { isRecentlyOnline } from '@/modules/messaging/types/messaging';
import { useEntitlements, useLikers } from '@/modules/premium/hooks/usePremium';
import { useSavedFavorites, useToggleFavorite } from '@/modules/favorites/hooks/useSavedFavorites';
import { colors, gradients } from '@/shared/constants/theme';

type MatchesTab = 'matchs' | 'favoris';

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="mb-3 font-heading text-[13px] text-ink/60">{children}</Text>
  );
}

export function MatchListScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<MatchesTab>('matchs');
  const conversationsQuery = useConversationsQuery();
  const entitlements = useEntitlements();
  const isPremium = entitlements.data?.isPremium ?? false;
  const likersCount = entitlements.data?.likersCount ?? 0;
  const likersQuery = useLikers(isPremium);
  // Favoris = signets gardés depuis Découvrir (table profile_favorites),
  // pas les likes envoyés — deux notions distinctes.
  const favoritesQuery = useSavedFavorites();
  const toggleFavorite = useToggleFavorite();

  const matches = conversationsQuery.data ?? [];
  const newMatchesCount = matches.filter((m) => !m.lastMessage).length;
  const likers = likersQuery.data ?? [];
  const favorites = favoritesQuery.data ?? [];

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
          className="mb-4 flex-row items-center gap-2.5 rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45] px-4 py-3.5"
        >
          <SearchIcon size={15} color="rgba(62,53,82,0.28)" />
          <Text className="font-body text-[13px] text-ink/30">Rechercher un match…</Text>
        </Pressable>

        {/* Onglets Matchs | Favoris */}
        <View className="mb-5 flex-row rounded-full border-[1.5px] border-white/70 bg-white/[0.45] p-1">
          {(
            [
              { key: 'matchs', label: 'Matchs' },
              { key: 'favoris', label: `Favoris${favorites.length > 0 ? ` (${favorites.length})` : ''}` },
            ] as { key: MatchesTab; label: string }[]
          ).map(({ key, label }) => {
            const active = tab === key;
            return (
              <Pressable key={key} onPress={() => setTab(key)} className="flex-1">
                {active ? (
                  <LinearGradient
                    colors={gradients.brand}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 999, paddingVertical: 9 }}
                  >
                    <Text className="text-center font-heading text-[12.5px] text-white">{label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={{ paddingVertical: 9 }}>
                    <Text className="text-center font-heading text-[12.5px] text-ink/45">{label}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {conversationsQuery.isLoading ? (
        <View className="items-center pt-10">
          <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
        </View>
      ) : tab === 'matchs' ? (
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
              <View className="px-[22px]">
                <SectionTitle>Nouveaux matchs</SectionTitle>
              </View>
              <FlashList
                data={matches}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.matchId}
                contentContainerClassName="px-[22px]"
                renderItem={({ item, index }) => (
                  <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 60)}>
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
                      <Text className="font-heading text-[10px] text-ink" numberOfLines={1}>
                        {item.partnerFirstName}
                      </Text>
                    </Pressable>
                  </Animated.View>
                )}
              />
            </View>
          )}

          {/* Qui vous a aimé — visible en Premium ; sinon un simple rappel
              discret (l'ancien gros bloc dégradé débordait et criait). */}
          <View className="px-[22px]">
            {isPremium && likers.length > 0 ? (
              <>
                <SectionTitle>Qui vous a aimé</SectionTitle>
                <View className="mb-6 flex-row flex-wrap gap-2.5">
                  {likers.slice(0, 12).map((liker, index) => (
                    <Animated.View
                      key={liker.id}
                      entering={FadeInDown.delay(Math.min(index, 6) * 50)}
                    >
                      <Pressable
                        onPress={() => router.push(`/profile/${liker.id}`)}
                        className="items-center gap-1.5 active:opacity-80"
                        style={{ width: 72 }}
                      >
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
                          <Text className="font-heading text-[10px] text-ink" numberOfLines={1}>
                            {liker.firstName}
                          </Text>
                          {liker.isVerified ? <BadgeCheck size={9} color={colors.gold.DEFAULT} strokeWidth={2.8} /> : null}
                        </View>
                      </Pressable>
                    </Animated.View>
                  ))}
                </View>
              </>
            ) : !isPremium && likersCount > 0 ? (
              <Pressable
                onPress={() => router.push('/premium')}
                className="mb-6 flex-row items-center gap-3 rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45] px-4 py-3 active:opacity-85"
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-brand/10">
                  <Lock size={14} color={colors.brand.DEFAULT} strokeWidth={2.2} />
                </View>
                <Text className="flex-1 font-body text-[12.5px] text-ink-muted" numberOfLines={2}>
                  <Text className="font-heading-semibold text-ink">{likersCount}</Text> personne
                  {likersCount > 1 ? 's' : ''} t{likersCount > 1 ? "'ont" : "'a"} liké — visible avec Premium
                </Text>
                <ChevronRight size={16} color="rgba(46,36,64,0.25)" />
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      ) : (
        /* Onglet Favoris — les profils gardés en signet depuis Découvrir.
           Rien à voir avec un like : c'est votre sélection personnelle. */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-[22px] pb-32">
          {favoritesQuery.isLoading ? (
            <ActivityIndicator color={colors.brand.DEFAULT} style={{ marginTop: 24 }} />
          ) : favorites.length === 0 ? (
            <EmptyState
              icon={<Bookmark size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
              title="Aucun favori"
              description="Dans Découvrir, touchez le signet 🔖 sur un profil qui vous plaît : il restera ici."
              actionLabel="Découvrir des profils"
              onAction={() => router.push('/(tabs)/discover')}
            />
          ) : (
            favorites.map((favorite, index) => (
              <Animated.View
                key={favorite.id}
                entering={FadeInDown.delay(Math.min(index, 8) * 45)}
              >
                <Pressable
                  onPress={() => router.push(`/profile/${favorite.id}`)}
                  className="mb-2 flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45] px-4 py-3 active:opacity-85"
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
                    hitSlop={8}
                    accessibilityLabel="Retirer des favoris"
                    onPress={() =>
                      toggleFavorite.mutate({ targetId: favorite.id, isFavorite: true })
                    }
                  >
                    <Bookmark size={17} color={colors.brand.DEFAULT} fill={colors.brand.DEFAULT} />
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
