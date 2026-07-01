import { View, Text, Pressable } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import { SearchFieldLayout } from '@/modules/search/components/SearchFieldLayout';
import { useSearchFiltersStore } from '@/modules/search/stores/searchFiltersStore';
import { colors } from '@/shared/constants/theme';

export function VerifiedFilterScreen() {
  const { verifiedOnly, toggleVerifiedOnly } = useSearchFiltersStore();

  return (
    <SearchFieldLayout title="Vérification" scrollable={false}>
      <Pressable
        onPress={toggleVerifiedOnly}
        className="flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-4"
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-gold/[0.12]">
          <BadgeCheck size={16} color={colors.gold.DEFAULT} />
        </View>
        <Text className="flex-1 font-heading-semibold text-[14px] uppercase text-ink">
          Profils vérifiés uniquement
        </Text>
        <View className={`h-7 w-12 rounded-full ${verifiedOnly ? 'bg-brand' : 'bg-ink/10'} justify-center px-1`}>
          <View
            className="h-5 w-5 rounded-full bg-white"
            style={{ marginLeft: verifiedOnly ? 20 : 0, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3 }}
          />
        </View>
      </Pressable>
    </SearchFieldLayout>
  );
}
