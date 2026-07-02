import { useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MapPin, BadgeCheck, Settings, ShieldCheck } from 'lucide-react-native';
import { PhotoPlaceholder } from '@/shared/components/ui/PhotoPlaceholder';
import { Chip } from '@/shared/components/ui/Chip';
import { FullScreenLoader } from '@/shared/components/feedback';
import { colors, gradients } from '@/shared/constants/theme';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useProfileStats } from '@/modules/profile/hooks/useProfileStats';
import { useInterestsQuery } from '@/modules/profile/hooks/useReferenceData';
import { computeProfileCompletion, calculateAge } from '@/modules/profile/types/profile';

function AnimatedProgressBar({ percent }: { percent: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(350, withTiming(percent, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [percent, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  return (
    <View className="h-1.5 overflow-hidden rounded-full bg-ink/[0.08]">
      <Animated.View style={[{ height: '100%', borderRadius: 3, overflow: 'hidden' }, fillStyle]}>
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: '100%', width: '100%' }}
        />
      </Animated.View>
    </View>
  );
}

export function MyProfileScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const statsQuery = useProfileStats();
  const interestsQuery = useInterestsQuery();

  const profile = profileQuery.data;

  const completionPercent = useMemo(() => {
    if (!profile) return 0;
    const { missing } = computeProfileCompletion(profile);
    const fields = Object.values(missing);
    const done = fields.filter((m) => !m).length;
    return Math.round((done / fields.length) * 100);
  }, [profile]);

  const interestLabels = useMemo(() => {
    if (!profile || !interestsQuery.data) return [];
    const byId = new Map(interestsQuery.data.map((i) => [i.id, i.label]));
    return profile.interestIds.map((id) => byId.get(id)).filter((label): label is string => Boolean(label));
  }, [profile, interestsQuery.data]);

  if (!profile) {
    return <FullScreenLoader />;
  }

  const age = profile.birthDate ? calculateAge(profile.birthDate) : null;
  const locationLabel = [profile.city, profile.country].filter(Boolean).join(', ');
  const stats = [
    { value: String(statsQuery.data?.likesReceived ?? '—'), label: 'Likes reçus', color: colors.brand.DEFAULT },
    { value: String(statsQuery.data?.matchesCount ?? '—'), label: 'Matches', color: colors.gold.DEFAULT },
    { value: statsQuery.data ? `${statsQuery.data.matchRate}%` : '—', label: 'Taux match', color: colors.success },
  ];

  return (
    <View className="flex-1 bg-cream">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-28">
        <View style={{ height: 310 }} className="relative overflow-hidden">
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={{ flex: 1 }} contentFit="cover" transition={250} />
          ) : (
            <PhotoPlaceholder seed={0} style={{ flex: 1 }} showIcon iconSize={44} />
          )}
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
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => router.push('/edit-profile')}
                className="rounded-full bg-white/90 px-3.5 py-2 active:opacity-80"
              >
                <Text className="font-heading text-[11px] uppercase text-brand">Modifier</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/settings')}
                hitSlop={6}
                className="h-[34px] w-[34px] items-center justify-center rounded-full bg-white/90 active:opacity-80"
                accessibilityLabel="Paramètres"
              >
                <Settings size={16} color={colors.brand.DEFAULT} strokeWidth={2.1} />
              </Pressable>
            </View>
          </View>

          {completionPercent < 100 ? (
            <Animated.View
              entering={FadeInDown.delay(120).springify().damping(16)}
              className="absolute inset-x-[18px]"
              style={{ top: 206 }}
            >
              <Pressable
                onPress={() => router.push('/edit-profile/completion')}
                className="flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/95 bg-white/85 px-4 py-3.5 active:opacity-90"
                style={{ shadowColor: colors.ink.soft, shadowOpacity: 0.1, shadowRadius: 22, shadowOffset: { width: 0, height: 6 } }}
              >
                <View className="flex-1">
                  <View className="mb-1.5 flex-row justify-between">
                    <Text className="font-heading text-[11px] uppercase text-ink">Profil complété</Text>
                    <Text className="font-heading text-[12px] text-brand">{completionPercent}%</Text>
                  </View>
                  <AnimatedProgressBar percent={completionPercent} />
                </View>
                <View className="rounded-xl bg-brand px-3.5 py-2.5">
                  <Text className="font-heading text-[11px] uppercase text-white">Compléter</Text>
                </View>
              </Pressable>
            </Animated.View>
          ) : null}
        </View>

        <View className="px-[22px] pt-6">
          <Animated.View entering={FadeInDown.delay(180).springify().damping(16)}>
            <View className="mb-1 flex-row items-center justify-between">
              <View className="flex-row items-baseline gap-2">
                <Text className="font-display text-[32px] text-ink">{profile.firstName ?? 'Moi'},</Text>
                {age != null ? (
                  <Text className="font-display-semibold text-[26px] text-ink-muted">{age}</Text>
                ) : null}
              </View>
              {profile.isVerified ? (
                <View className="flex-row items-center gap-1.5 rounded-full bg-gold/[0.12] px-3 py-1.5">
                  <BadgeCheck size={11} color={colors.gold.DEFAULT} strokeWidth={2.8} />
                  <Text className="font-heading text-[10px] uppercase text-gold">
                    {profile.gender === 'femme' ? 'Vérifiée' : 'Vérifié'}
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => router.push('/kyc/upload-id')}
                  className="flex-row items-center gap-1.5 rounded-full bg-brand/[0.1] px-3 py-1.5 active:opacity-80"
                >
                  <ShieldCheck size={11} color={colors.brand.DEFAULT} strokeWidth={2.6} />
                  <Text className="font-heading text-[10px] uppercase text-brand">Me vérifier</Text>
                </Pressable>
              )}
            </View>
            {locationLabel ? (
              <View className="mb-3 flex-row items-center gap-1.5">
                <MapPin size={12} color={colors.ink.muted} />
                <Text className="font-body-medium text-[12px] text-ink-muted">{locationLabel}</Text>
              </View>
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).springify().damping(16)}>
            <Pressable
              onPress={() => router.push('/edit-profile/bio')}
              className="mb-3 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5 active:opacity-90"
            >
              <Text className="mb-1.5 font-heading text-[9.5px] uppercase tracking-widest text-ink/35">À propos</Text>
              {profile.bio ? (
                <Text className="font-body text-[12.5px] leading-[19px] text-ink">{profile.bio}</Text>
              ) : (
                <Text className="font-body italic text-[12.5px] leading-[19px] text-ink-muted">
                  Ajoutez une bio pour attirer 2× plus de visites.
                </Text>
              )}
            </Pressable>
          </Animated.View>

          {interestLabels.length > 0 ? (
            <Animated.View
              entering={FadeInDown.delay(300).springify().damping(16)}
              className="mb-3.5 flex-row flex-wrap gap-2"
            >
              {interestLabels.map((interest) => (
                <Chip key={interest} label={interest} />
              ))}
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(360).springify().damping(16)} className="flex-row gap-2.5">
            {stats.map((stat) => (
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
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
