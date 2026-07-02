import { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search as SearchIcon, X, BadgeCheck } from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/layout';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { Avatar } from '@/shared/components/ui/Avatar';
import { EmptyState } from '@/shared/components/feedback';
import { discoveryService } from '@/modules/discovery/services/discoveryService';
import { colors } from '@/shared/constants/theme';

const DEBOUNCE_MS = 350;

export function DiscoverySearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const search = useQuery({
    queryKey: ['discovery-search', debouncedQuery],
    queryFn: () => discoveryService.searchByText(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  const results = search.data ?? [];
  const showIdle = debouncedQuery.length < 2;

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream" />

      <View className="mb-4 flex-row items-center gap-3 px-6" style={{ paddingTop: 24 }}>
        <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5">
          <SearchIcon size={16} color="rgba(44,20,8,0.28)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Prénom, ville, pays…"
            placeholderTextColor="rgba(26,8,4,0.28)"
            autoFocus
            className="flex-1 font-body text-[14px] text-ink"
          />
          {search.isFetching ? <ActivityIndicator size="small" color={colors.brand.DEFAULT} /> : null}
        </View>
        <Pressable onPress={() => router.back()}>
          <GlassSurface variant="light" radius={15} style={{ width: 44, height: 44 }}>
            <View className="h-11 w-11 items-center justify-center">
              <X size={18} color={colors.ink.DEFAULT} />
            </View>
          </GlassSurface>
        </Pressable>
      </View>

      {showIdle ? (
        <EmptyState
          icon={<SearchIcon size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
          title="Recherchez un profil"
          description="Saisissez au moins 2 caractères : prénom, ville ou pays."
        />
      ) : !search.isFetching && results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
          title="Aucun résultat"
          description={`Aucun profil ne correspond à "${debouncedQuery}".`}
        />
      ) : (
        <FlashList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-6 pb-8"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).springify().damping(17)}>
              <Pressable
                onPress={() => router.push(`/profile/${item.id}`)}
                className="mb-2 flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5 active:opacity-80"
              >
                <Avatar source={item.avatarUrl ?? undefined} seed={item.firstName} size={48} />
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="font-heading text-[14px] uppercase text-ink">
                      {item.firstName}, {item.age}
                    </Text>
                    {item.isVerified ? (
                      <BadgeCheck size={12} color={colors.gold.DEFAULT} strokeWidth={2.6} />
                    ) : null}
                  </View>
                  <Text className="font-body text-[12px] text-ink-muted">
                    {[item.city, item.country].filter(Boolean).join(', ')}
                    {item.distanceKm != null ? ` · ${item.distanceKm} km` : ''}
                  </Text>
                </View>
                <Text className="font-heading text-[12px] text-brand">{item.compatibility}%</Text>
              </Pressable>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}
