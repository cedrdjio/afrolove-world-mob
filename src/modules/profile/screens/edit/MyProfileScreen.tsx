import { useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MapPin, BadgeCheck, Settings, ShieldCheck, Pencil, Crown } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Chip } from '@/shared/components/ui/Chip';
import { FullScreenLoader } from '@/shared/components/feedback';
import { colors, gradients } from '@/shared/constants/theme';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useProfileStats } from '@/modules/profile/hooks/useProfileStats';
import { useInterestsQuery } from '@/modules/profile/hooks/useReferenceData';
import { useEntitlements } from '@/modules/premium/hooks/usePremium';
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

/** Écran « Mon profil » conforme à la maquette 08 : carte identité avec
 *  progression, stats Vues/Likes/Matchs, carte Ma bio éditable et carte
 *  AfriLove Premium qui reflète l'abonnement réel. */
export function MyProfileScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const statsQuery = useProfileStats();
  const interestsQuery = useInterestsQuery();
  const entitlements = useEntitlements();

  const profile = profileQuery.data;
  const isPremium = entitlements.data?.isPremium ?? false;

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
  const locationLabel = [profile.city, profile.country].filter(Boolean).join(' · ');
  const stats = [
    { value: statsQuery.data ? String(statsQuery.data.viewsCount) : '—', label: 'Vues', color: colors.ink.DEFAULT },
    { value: statsQuery.data ? String(statsQuery.data.likesReceived) : '—', label: 'Likes', color: colors.brand.DEFAULT },
    { value: statsQuery.data ? String(statsQuery.data.matchesCount) : '—', label: 'Matchs', color: colors.gold.DEFAULT },
  ];

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={230} color="rgba(106,79,192,0.09)" top={-50} left={-50} duration={9500} />
      </ScreenBackground>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-[22px] pb-32" style={{ paddingTop: 64 }}>
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="font-display text-[30px] uppercase text-ink">Mon profil</Text>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={6}
            className="h-[40px] w-[40px] items-center justify-center rounded-2xl border-[1.5px] border-white/90 bg-white/70 active:opacity-80"
            accessibilityLabel="Paramètres"
          >
            <Settings size={17} color={colors.brand.DEFAULT} strokeWidth={2.1} />
          </Pressable>
        </View>

        {/* Carte identité : avatar, nom, ville, progression du profil. */}
        <Animated.View entering={FadeInDown.delay(80).springify().damping(16)}>
          <View className="mb-3.5 rounded-3xl border-[1.5px] border-white/90 bg-white/75 p-4">
            <View className="flex-row items-center gap-3.5">
              <Pressable onPress={() => router.push('/edit-profile/photos')} className="active:opacity-85">
                <Avatar source={profile.avatarUrl ?? undefined} seed={profile.firstName ?? 'moi'} size={64} />
                <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full bg-brand">
                  <Pencil size={11} color="#fff" strokeWidth={2.4} />
                </View>
              </Pressable>
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-display text-[22px] text-ink" numberOfLines={1}>
                    {profile.firstName ?? 'Moi'}
                    {age != null ? `, ${age}` : ''}
                  </Text>
                  {profile.isVerified ? (
                    <BadgeCheck size={15} color={colors.gold.DEFAULT} strokeWidth={2.6} />
                  ) : null}
                </View>
                {locationLabel ? (
                  <View className="mt-0.5 flex-row items-center gap-1.5">
                    <MapPin size={11} color={colors.ink.muted} />
                    <Text className="font-body-medium text-[11.5px] text-ink-muted">{locationLabel}</Text>
                  </View>
                ) : null}
              </View>
              <Pressable
                onPress={() => router.push('/edit-profile')}
                className="rounded-full bg-brand/10 px-3 py-2 active:opacity-80"
              >
                <Text className="font-heading text-[10px] uppercase text-brand">Modifier</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.push('/edit-profile/completion')}
              className="mt-4 active:opacity-90"
              disabled={completionPercent >= 100}
            >
              <View className="mb-1.5 flex-row justify-between">
                <Text className="font-heading text-[10px] uppercase text-ink/50">
                  Profil complété à {completionPercent}%
                </Text>
                {completionPercent < 100 ? (
                  <Text className="font-heading text-[10px] uppercase text-brand">Compléter</Text>
                ) : null}
              </View>
              <AnimatedProgressBar percent={completionPercent} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Vérification d'identité (badge) si pas encore faite. */}
        {!profile.isVerified ? (
          <Animated.View entering={FadeInDown.delay(140).springify().damping(16)}>
            <Pressable
              onPress={() => router.push('/kyc/upload-id')}
              className="mb-3.5 flex-row items-center gap-3 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3 active:opacity-85"
            >
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand/[0.1]">
                <ShieldCheck size={16} color={colors.brand.DEFAULT} strokeWidth={2.2} />
              </View>
              <View className="flex-1">
                <Text className="font-heading text-[11.5px] uppercase text-ink">Vérifier mon profil</Text>
                <Text className="font-body text-[10.5px] text-ink-muted">Obtenez le badge certifié ✓</Text>
              </View>
            </Pressable>
          </Animated.View>
        ) : null}

        {/* Stats façon maquette : Vues / Likes / Matchs. */}
        <Animated.View entering={FadeInDown.delay(200).springify().damping(16)} className="mb-3.5 flex-row gap-2.5">
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

        {/* Ma bio. */}
        <Animated.View entering={FadeInDown.delay(260).springify().damping(16)}>
          <Pressable
            onPress={() => router.push('/edit-profile/bio')}
            className="mb-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5 active:opacity-90"
          >
            <View className="mb-1.5 flex-row items-center justify-between">
              <Text className="font-heading text-[9.5px] uppercase tracking-widest text-ink/35">Ma bio</Text>
              <Pencil size={11} color={colors.brand.DEFAULT} strokeWidth={2.2} />
            </View>
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
            entering={FadeInDown.delay(320).springify().damping(16)}
            className="mb-3.5 flex-row flex-wrap gap-2"
          >
            {interestLabels.map((interest) => (
              <Chip key={interest} label={interest} size="sm" />
            ))}
          </Animated.View>
        ) : null}

        {/* Carte AfriLove Premium — reflète l'abonnement réel au lieu de
            proposer « Essayer » à un compte déjà premium. */}
        <Animated.View entering={FadeInDown.delay(380).springify().damping(16)}>
          <Pressable
            onPress={() => router.push(isPremium ? '/premium/pricing' : '/premium')}
            className="active:opacity-90"
          >
            <LinearGradient
              colors={gradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 16 }}
            >
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-white/[0.16]">
                  <Crown size={20} color="#fff" strokeWidth={1.9} />
                </View>
                <View className="flex-1">
                  <Text className="mb-0.5 font-heading text-[13px] uppercase text-white">AfriLove Premium</Text>
                  <Text className="font-body text-[11px] text-white/70">
                    {isPremium
                      ? `Actif jusqu'au ${
                          entitlements.data?.premiumUntil
                            ? new Date(entitlements.data.premiumUntil).toLocaleDateString('fr-FR')
                            : '—'
                        }`
                      : "Vois qui t'a déjà liké"}
                  </Text>
                </View>
                <View className="rounded-full bg-white px-3.5 py-2">
                  <Text className="font-heading text-[10.5px] uppercase text-brand">
                    {isPremium ? 'Prolonger' : 'Essayer'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
