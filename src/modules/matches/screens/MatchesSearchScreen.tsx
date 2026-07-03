import { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/layout';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { Avatar } from '@/shared/components/ui/Avatar';
import { EmptyState } from '@/shared/components/feedback';
import { useConversationsQuery } from '@/modules/messaging/hooks/useMessaging';
import { isRecentlyOnline } from '@/modules/messaging/types/messaging';
import { colors } from '@/shared/constants/theme';

export function MatchesSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const conversationsQuery = useConversationsQuery();

  const results = useMemo(() => {
    const matches = conversationsQuery.data ?? [];
    if (!query.trim()) return matches;
    const needle = query.trim().toLowerCase();
    return matches.filter((m) => m.partnerFirstName.toLowerCase().includes(needle));
  }, [conversationsQuery.data, query]);

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream" />

      <View className="mb-4 flex-row items-center gap-3 px-6" style={{ paddingTop: 24 }}>
        <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5">
          <SearchIcon size={16} color="rgba(62,53,82,0.28)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un match…"
            placeholderTextColor="rgba(46,36,64,0.28)"
            autoFocus
            className="flex-1 font-body text-[14px] text-ink"
          />
        </View>
        <Pressable onPress={() => router.back()}>
          <GlassSurface variant="light" radius={15} style={{ width: 44, height: 44 }}>
            <View className="h-11 w-11 items-center justify-center">
              <X size={18} color={colors.ink.DEFAULT} />
            </View>
          </GlassSurface>
        </Pressable>
      </View>

      {conversationsQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
        </View>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
          title="Aucun résultat"
          description={
            query.trim() ? `Aucun match ne correspond à "${query}".` : "Vous n'avez pas encore de match."
          }
        />
      ) : (
        <FlashList
          data={results}
          keyExtractor={(item) => item.matchId}
          contentContainerClassName="px-6 pb-8"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).springify().damping(17)}>
              <Pressable
                onPress={() => router.push(`/chat/${item.matchId}`)}
                className="mb-2 flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5 active:opacity-85"
              >
                <Avatar
                  source={item.partnerAvatarUrl ?? undefined}
                  seed={item.partnerFirstName}
                  size={48}
                  ringColor={isRecentlyOnline(item.partnerLastActiveAt) ? colors.success : undefined}
                />
                <View className="flex-1">
                  <Text className="mb-0.5 font-heading text-[14px] uppercase text-ink">{item.partnerFirstName}</Text>
                  <Text numberOfLines={1} className="font-body text-[12px] text-ink-muted">
                    {item.lastMessage ?? 'Nouveau match'}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}
