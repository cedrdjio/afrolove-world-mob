import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SlidersHorizontal, Search as SearchIcon, Bell } from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/layout';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { Chip } from '@/shared/components/ui/Chip';
import { colors } from '@/shared/constants/theme';
import { MOCK_PROFILES } from '@/modules/discovery/constants/mockProfiles';
import { SwipeCard, type SwipeDirection } from '@/modules/discovery/components/SwipeCard';
import { ActionButtons } from '@/modules/discovery/components/ActionButtons';
import { NoProfilesState } from '@/modules/discovery/screens/NoProfilesScreen';

const FILTERS = ['Tous', 'Nouveaux', 'En ligne'];

export function SwipeScreen() {
  const router = useRouter();
  const [deckIndex, setDeckIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('Tous');

  const visibleCards = MOCK_PROFILES.slice(deckIndex, deckIndex + 3);
  const isEmpty = deckIndex >= MOCK_PROFILES.length;

  const handleSwiped = (_direction: SwipeDirection) => {
    setDeckIndex((i) => i + 1);
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream" />

      <View className="flex-row items-center justify-between px-5 pt-16">
        <Pressable onPress={() => router.push('/discover-filters')}>
          <GlassSurface variant="light" radius={15} style={{ width: 44, height: 44 }}>
            <View className="h-11 w-11 items-center justify-center gap-1">
              <SlidersHorizontal size={17} color={colors.ink.DEFAULT} />
            </View>
          </GlassSurface>
        </Pressable>
        <Text className="font-display text-[22px] uppercase tracking-wide text-ink">Découvrir</Text>
        <Pressable onPress={() => router.push('/notifications')}>
          <GlassSurface variant="light" radius={15} style={{ width: 44, height: 44 }}>
            <View className="h-11 w-11 items-center justify-center">
              <Bell size={18} color={colors.ink.DEFAULT} />
              <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-cream bg-brand" />
            </View>
          </GlassSurface>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2.5 px-5 pt-6">
        {FILTERS.map((filter) => (
          <Chip key={filter} label={filter} selected={activeFilter === filter} onPress={() => setActiveFilter(filter)} />
        ))}
        <Pressable onPress={() => router.push('/discover-search')} className="ml-auto">
          <GlassSurface variant="light" radius={15} style={{ width: 38, height: 38 }}>
            <View className="h-[38px] w-[38px] items-center justify-center">
              <SearchIcon size={16} color={colors.ink.DEFAULT} />
            </View>
          </GlassSurface>
        </Pressable>
      </View>

      <View className="mx-[18px] mt-6 flex-1" style={{ marginBottom: 210 }}>
        {isEmpty ? (
          <NoProfilesState onOpenFilters={() => router.push('/discover-filters')} />
        ) : (
          visibleCards
            .map((profile, i) => (
              <SwipeCard
                key={profile.id}
                profile={profile}
                isTop={i === 0}
                stackIndex={i}
                onSwiped={handleSwiped}
                onTap={() => router.push(`/profile/${profile.id}`)}
              />
            ))
            .reverse()
        )}
      </View>

      {!isEmpty ? (
        <View className="absolute inset-x-0" style={{ bottom: 118 }}>
          <ActionButtons
            onNope={() => handleSwiped('left')}
            onSuperLike={() => handleSwiped('up')}
            onLike={() => handleSwiped('right')}
            onBoost={() => router.push('/premium')}
          />
        </View>
      ) : null}
    </View>
  );
}
