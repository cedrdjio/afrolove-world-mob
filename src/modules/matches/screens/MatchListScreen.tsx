import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search as SearchIcon, Heart } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { Avatar } from '@/shared/components/ui/Avatar';
import { EmptyState } from '@/shared/components/feedback';
import { useConversationsQuery } from '@/modules/messaging/hooks/useMessaging';
import { isRecentlyOnline } from '@/modules/messaging/types/messaging';
import { colors } from '@/shared/constants/theme';

export function MatchListScreen() {
  const router = useRouter();
  const conversationsQuery = useConversationsQuery();

  const matches = conversationsQuery.data ?? [];
  // "Nouveaux" = matches where nobody has spoken yet.
  const newMatchesCount = matches.filter((m) => !m.lastMessage).length;

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
      ) : matches.length === 0 ? (
        <EmptyState
          icon={<Heart size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
          title="Pas encore de match"
          description="Continuez à explorer pour trouver vos premiers matches."
          actionLabel="Découvrir des profils"
          onAction={() => router.push('/(tabs)/discover')}
        />
      ) : (
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
      )}
    </View>
  );
}
