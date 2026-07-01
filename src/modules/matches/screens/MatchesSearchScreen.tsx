import { useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/layout';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { Avatar } from '@/shared/components/ui/Avatar';
import { EmptyState } from '@/shared/components/feedback';
import { MOCK_CONVERSATIONS } from '@/modules/matches/constants/mockMatches';
import { colors } from '@/shared/constants/theme';

export function MatchesSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return MOCK_CONVERSATIONS;
    return MOCK_CONVERSATIONS.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));
  }, [query]);

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream" />

      <View className="mb-4 flex-row items-center gap-3 px-6" style={{ paddingTop: 24 }}>
        <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5">
          <SearchIcon size={16} color="rgba(44,20,8,0.28)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un match…"
            placeholderTextColor="rgba(26,8,4,0.28)"
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

      {results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
          title="Aucun résultat"
          description={`Aucun match ne correspond à "${query}".`}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-6 pb-8"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/chat/${item.id}`)}
              className="mb-2 flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5"
            >
              <Avatar seed={item.name} size={48} />
              <Text className="font-heading text-[14px] uppercase text-ink">{item.name}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
