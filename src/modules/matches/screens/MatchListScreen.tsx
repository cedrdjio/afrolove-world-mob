import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search as SearchIcon, Heart, Star, Eye, BadgeCheck } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { Avatar } from '@/shared/components/ui/Avatar';
import { EmptyState } from '@/shared/components/feedback';
import { useConversationsQuery } from '@/modules/messaging/hooks/useMessaging';
import { isRecentlyOnline } from '@/modules/messaging/types/messaging';
import { useEntitlements, useFavorites, useLikers } from '@/modules/premium/hooks/usePremium';
import { colors, gradients } from '@/shared/constants/theme';

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="mb-3 font-heading text-[11px] uppercase tracking-widest text-ink/40">{children}</Text>
  );
}

export function MatchListScreen() {
  const router = useRouter();
  const conversationsQuery = useConversationsQuery();
  const entitlements = useEntitlements();
  const isPremium = entitlements.data?.isPremium ?? false;
  const likersCount = entitlements.data?.likersCount ?? 0;
  const likersQuery = useLikers(isPremium);
  const favoritesQuery = useFavorites();

  const matches = conversationsQuery.data ?? [];
  const newMatchesCount = matches.filter((m) => !m.lastMessage).length;
  const likers = likersQuery.data ?? [];
  const favorites = (favoritesQuery.data ?? []).filter((f) => !f.isMatched);

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={230} color="rgba(200,96,64,0.09)" top={-50} right={-50} duration={9500} />
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
          className="mb-5 flex-row items-center gap-2.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5"
        >
          <SearchIcon size={15} color="rgba(44,20,8,0.28)" />
          <Text className="font-body text-[13px] text-ink/30">Rechercher un match…</Text>
        </Pressable>
      </View>

      {conversationsQuery.isLoading ? (
        <View className="items-center pt-10">
          <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32">
          {matches.length === 0 ? (
            <View className="px-[22px] pb-4">
              <EmptyState
                icon={<Heart size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
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

          {/* Qui vous a aimé — premium reveal, real count for everyone. */}
          <View className="px-[22px]">
            <SectionTitle>Qui vous a aimé</SectionTitle>
            {isPremium && likers.length > 0 ? (
              <View className="mb-6 flex-row flex-wrap gap-2.5">
                {likers.slice(0, 8).map((liker, index) => (
                  <Animated.View
                    key={liker.id}
                    entering={FadeInDown.delay(Math.min(index, 6) * 50).springify().damping(16)}
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
                        <Text className="font-heading text-[10px] uppercase text-ink" numberOfLines={1}>
                          {liker.firstName}
                        </Text>
                        {liker.isVerified ? <BadgeCheck size={9} color={colors.gold.DEFAULT} strokeWidth={2.8} /> : null}
                      </View>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <Pressable onPress={() => router.push('/premium')} className="mb-6 active:opacity-90">
                <LinearGradient
                  colors={gradients.brand}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 20, padding: 18 }}
                >
                  <View className="flex-row items-center gap-3.5">
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-white/[0.18]">
                      <Eye size={22} color="#fff" strokeWidth={1.9} />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-0.5 font-heading text-[14px] uppercase text-white">
                        {likersCount > 0
                          ? `${likersCount} personne${likersCount > 1 ? 's' : ''} vous ${likersCount > 1 ? 'ont' : 'a'} aimé`
                          : 'Voyez qui vous a aimé'}
                      </Text>
                      <Text className="font-body text-[11.5px] text-white/70">
                        Passez Premium pour découvrir leurs profils.
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>
            )}

            {/* Mes favoris — the profiles I liked, awaiting their answer. */}
            <SectionTitle>Mes favoris</SectionTitle>
            {favoritesQuery.isLoading ? (
              <ActivityIndicator color={colors.brand.DEFAULT} style={{ marginTop: 12 }} />
            ) : favorites.length === 0 ? (
              <Text className="font-body text-[12.5px] leading-[19px] text-ink-muted">
                Les profils que vous likez apparaîtront ici en attendant leur réponse.
              </Text>
            ) : (
              favorites.slice(0, 20).map((favorite, index) => (
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
          </View>
        </ScrollView>
      )}
    </View>
  );
}
