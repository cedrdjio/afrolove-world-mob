import { View, Text } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import { SearchFieldLayout } from '@/modules/search/components/SearchFieldLayout';
import { ToggleSwitch } from '@/shared/components/ui/ToggleSwitch';
import { useSearchFiltersStore } from '@/modules/search/stores/searchFiltersStore';
import { colors } from '@/shared/constants/theme';

export function VerifiedFilterScreen() {
  const { verifiedOnly, toggleVerifiedOnly } = useSearchFiltersStore();

  return (
    <SearchFieldLayout title="Vérification" scrollable={false}>
      <View className="flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45] px-4 py-4">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-gold/[0.12]">
          <BadgeCheck size={16} color={colors.gold.DEFAULT} />
        </View>
        <Text className="flex-1 font-heading-semibold text-[14px] text-ink">
          Profils vérifiés uniquement
        </Text>
        <ToggleSwitch value={verifiedOnly} onChange={() => toggleVerifiedOnly()} />
      </View>
    </SearchFieldLayout>
  );
}
