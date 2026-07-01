import { View, Text } from 'react-native';
import { BadgeCheck, Heart } from 'lucide-react-native';
import { colors } from '@/shared/constants/theme';

export function VerifiedBadge({ tone = 'onLight' }: { tone?: 'onLight' | 'onDark' | 'chip' }) {
  if (tone === 'chip') {
    return (
      <View className="flex-row items-center gap-1.5 self-start rounded-full bg-gold/10 px-2.5 py-1.5">
        <BadgeCheck size={11} color={colors.gold.DEFAULT} strokeWidth={2.5} />
        <Text className="font-heading text-[10px] uppercase text-gold">Vérifiée</Text>
      </View>
    );
  }
  return (
    <View className="flex-row items-center gap-1 self-start rounded-full border border-white/95 bg-white/[0.88] px-2.5 py-1.5">
      <BadgeCheck size={10} color={colors.gold.DEFAULT} strokeWidth={2.8} />
      <Text className="font-heading-semibold text-[10px] uppercase text-ink">Vérifiée</Text>
    </View>
  );
}

export function MatchBadge({ percent }: { percent: number }) {
  return (
    <View className="flex-row items-center gap-1.5 self-start rounded-full border border-white/95 bg-white/[0.88] px-3 py-1.5">
      <Heart size={11} color={colors.brand.DEFAULT} fill={colors.brand.DEFAULT} />
      <Text className="font-heading text-[11px] uppercase text-ink">{percent}% Match</Text>
    </View>
  );
}

export function CountBadge({ count, size = 22 }: { count: number; size?: number }) {
  if (count <= 0) return null;
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center bg-brand"
    >
      <Text className="font-heading text-[10px] text-white">{count > 99 ? '99+' : count}</Text>
    </View>
  );
}
