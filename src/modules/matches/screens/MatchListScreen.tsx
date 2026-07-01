import { View, Text, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, Heart } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { Avatar } from '@/shared/components/ui/Avatar';
import { EmptyState } from '@/shared/components/feedback';
import { NEW_MATCHES } from '@/modules/matches/constants/mockMatches';
import { colors } from '@/shared/constants/theme';

export function MatchListScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={230} color="rgba(200,96,64,0.09)" top={-50} right={-50} duration={9500} />
      </ScreenBackground>

      <View className="px-[22px]" style={{ paddingTop: 64 }}>
        <View className="mb-[18px] flex-row items-center justify-between">
          <Text className="font-display text-[30px] uppercase text-ink">Mes Matches</Text>
          <View className="rounded-full bg-brand/10 px-3 py-1.5">
            <Text className="font-heading text-[11.5px] uppercase text-brand">{NEW_MATCHES.length} nouveaux</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/matches-search')}
          className="mb-5 flex-row items-center gap-2.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5"
        >
          <SearchIcon size={15} color="rgba(44,20,8,0.28)" />
          <Text className="font-body text-[13px] text-ink/30">Rechercher un match…</Text>
        </Pressable>
      </View>

      {NEW_MATCHES.length === 0 ? (
        <EmptyState
          icon={<Heart size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
          title="Pas encore de match"
          description="Continuez à explorer pour trouver vos premiers matches."
          actionLabel="Découvrir des profils"
          onAction={() => router.push('/(tabs)/discover')}
        />
      ) : (
        <FlashList
          data={NEW_MATCHES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-[22px]"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/chat/${item.id}`)}
              className="mr-3.5 items-center gap-1.5"
              style={{ width: 62 }}
            >
              <Avatar
                seed={item.name}
                size={62}
                ringColor={item.isOnline ? colors.success : colors.gold.DEFAULT}
              />
              <Text className="font-heading text-[10px] uppercase text-ink" numberOfLines={1}>
                {item.name}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
