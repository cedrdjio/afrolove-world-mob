import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, BadgeCheck } from 'lucide-react-native';
import { PhotoPlaceholder } from '@/shared/components/ui/PhotoPlaceholder';
import { Chip } from '@/shared/components/ui/Chip';
import { colors, gradients } from '@/shared/constants/theme';

const PROFILE_COMPLETION = 78;

const STATS = [
  { value: '47', label: 'Likes reçus', color: colors.brand.DEFAULT },
  { value: '12', label: 'Matches', color: colors.gold.DEFAULT },
  { value: '94%', label: 'Taux match', color: colors.success },
];

const INTERESTS = ['Musique', 'Voyage', 'Lecture', 'Famille'];

export function MyProfileScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-cream">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-28">
        <View style={{ height: 310 }} className="relative overflow-hidden">
          <PhotoPlaceholder seed={0} style={{ flex: 1 }} showIcon iconSize={44} />
          <LinearGradient
            colors={['rgba(0,0,0,0.18)', 'transparent', colors.cream.DEFAULT]}
            locations={[0, 0.4, 1]}
            style={{ position: 'absolute', inset: 0 }}
          />
          <View className="absolute inset-x-[18px] flex-row items-center justify-between" style={{ top: 60 }}>
            <Text
              className="font-display text-[20px] uppercase text-white"
              style={{ textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } }}
            >
              Mon Profil
            </Text>
            <Pressable
              onPress={() => router.push('/edit-profile')}
              className="rounded-full bg-white/90 px-3.5 py-2"
            >
              <Text className="font-heading text-[11px] uppercase text-brand">Modifier</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push('/edit-profile/completion')}
            className="absolute inset-x-[18px] flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/95 bg-white/85 px-4 py-3.5"
            style={{ top: 206, shadowColor: colors.ink.soft, shadowOpacity: 0.1, shadowRadius: 22, shadowOffset: { width: 0, height: 6 } }}
          >
            <View className="flex-1">
              <View className="mb-1.5 flex-row justify-between">
                <Text className="font-heading text-[11px] uppercase text-ink">Profil complété</Text>
                <Text className="font-heading text-[12px] text-brand">{PROFILE_COMPLETION}%</Text>
              </View>
              <View className="h-1.5 overflow-hidden rounded-full bg-ink/[0.08]">
                <LinearGradient
                  colors={gradients.brand}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: '100%', width: `${PROFILE_COMPLETION}%`, borderRadius: 3 }}
                />
              </View>
            </View>
            <View className="rounded-xl bg-brand px-3.5 py-2.5">
              <Text className="font-heading text-[11px] uppercase text-white">Compléter</Text>
            </View>
          </Pressable>
        </View>

        <View className="px-[22px] pt-6">
          <View className="mb-1 flex-row items-center justify-between">
            <View className="flex-row items-baseline gap-2">
              <Text className="font-display text-[32px] text-ink">Amira,</Text>
              <Text className="font-display-semibold text-[26px] text-ink-muted">26</Text>
            </View>
            <View className="flex-row items-center gap-1.5 rounded-full bg-gold/[0.12] px-3 py-1.5">
              <BadgeCheck size={11} color={colors.gold.DEFAULT} strokeWidth={2.8} />
              <Text className="font-heading text-[10px] uppercase text-gold">Vérifiée</Text>
            </View>
          </View>
          <View className="mb-3 flex-row items-center gap-1.5">
            <MapPin size={12} color={colors.ink.muted} />
            <Text className="font-body-medium text-[12px] text-ink-muted">Lagos, Nigeria</Text>
          </View>

          <View className="mb-3 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5">
            <Text className="mb-1.5 font-heading text-[9.5px] uppercase tracking-widest text-ink/35">À propos</Text>
            <Text className="font-body text-[12.5px] leading-[19px] text-ink">
              Passionnée de musique afrobeats et de voyages. Je cherche quelqu'un de sincère qui partage mes
              valeurs africaines.
            </Text>
          </View>

          <View className="mb-3.5 flex-row flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <Chip key={interest} label={interest} />
            ))}
          </View>

          <View className="flex-row gap-2.5">
            {STATS.map((stat) => (
              <View
                key={stat.label}
                className="flex-1 items-center rounded-2xl border-[1.5px] border-white/90 bg-white/70 py-3.5"
              >
                <Text className="mb-1 font-display text-[22px]" style={{ color: stat.color }}>
                  {stat.value}
                </Text>
                <Text className="font-body-medium text-[10px] text-ink-muted">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
