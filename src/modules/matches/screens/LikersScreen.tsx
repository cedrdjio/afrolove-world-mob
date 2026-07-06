import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Heart, Lock, Star, BadgeCheck } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { PhotoPlaceholder } from '@/shared/components/ui/PhotoPlaceholder';
import { EmptyState } from '@/shared/components/feedback';
import { useEntitlements, useLikers } from '@/modules/premium/hooks/usePremium';
import { colors, gradients } from '@/shared/constants/theme';

/** Écran « Ils t'ont liké » (maquette 10) : grille dévoilée pour les comptes
 *  premium, tuiles floutées + CTA forfait pour les comptes gratuits. */
export function LikersScreen() {
  const router = useRouter();
  const entitlements = useEntitlements();
  const isPremium = entitlements.data?.isPremium ?? false;
  const likersCount = entitlements.data?.likersCount ?? 0;
  const likersQuery = useLikers(isPremium);
  const likers = likersQuery.data ?? [];

  const isLoading = entitlements.isLoading || (isPremium && likersQuery.isLoading);

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={280} color="rgba(155,126,222,0.16)" top={-60} right={-60} duration={9000} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 60 }}>
        <View className="mb-5 flex-row items-center">
          <Pressable onPress={() => router.back()} accessibilityLabel="Retour">
            <GlassSurface variant="dark" radius={14} style={{ width: 42, height: 42 }}>
              <View className="h-[42px] w-[42px] items-center justify-center">
                <ArrowLeft size={18} color="#fff" strokeWidth={2} />
              </View>
            </GlassSurface>
          </Pressable>
        </View>

        <Text className="text-center font-display-black text-[30px] uppercase text-white">Ils t'ont liké</Text>
        <Text className="mb-6 text-center font-body text-[12.5px] text-white/45">
          {likersCount > 0
            ? `${likersCount} personne${likersCount > 1 ? 's' : ''} attend${likersCount > 1 ? 'ent' : ''} ton like`
            : 'Personne pour le moment — continue à explorer !'}
        </Text>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.gold.DEFAULT} />
          </View>
        ) : likersCount === 0 ? (
          <EmptyState
            icon={<Heart size={30} color={colors.gold.DEFAULT} strokeWidth={1.6} />}
            title="Pas encore de like reçu"
            description="Complétez votre profil et likez des profils pour augmenter vos chances."
            actionLabel="Découvrir des profils"
            onAction={() => router.push('/(tabs)/discover')}
          />
        ) : isPremium ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
            <View className="flex-row flex-wrap justify-between">
              {likers.map((liker, index) => (
                <Animated.View
                  key={liker.id}
                  entering={FadeInDown.delay(Math.min(index, 8) * 60).springify().damping(16)}
                  style={{ width: '48.2%', marginBottom: 12 }}
                >
                  <Pressable
                    onPress={() => router.push(`/profile/${liker.id}`)}
                    className="overflow-hidden rounded-3xl border border-white/[0.14] active:opacity-90"
                    style={{ aspectRatio: 0.8 }}
                  >
                    {liker.avatarUrl ? (
                      <Image source={{ uri: liker.avatarUrl }} style={{ flex: 1 }} contentFit="cover" transition={200} />
                    ) : (
                      <PhotoPlaceholder seed={index + 1} style={{ flex: 1 }} showIcon />
                    )}
                    <LinearGradient
                      colors={['transparent', 'rgba(24,15,42,0.9)']}
                      locations={[0.5, 1]}
                      style={{ position: 'absolute', inset: 0 }}
                    />
                    <View className="absolute right-2.5 top-2.5 h-8 w-8 items-center justify-center rounded-full bg-brand">
                      {liker.action === 'super_like' ? (
                        <Star size={14} color="#fff" fill="#fff" />
                      ) : (
                        <Heart size={14} color="#fff" fill="#fff" />
                      )}
                    </View>
                    <View className="absolute inset-x-3 bottom-3 flex-row items-center gap-1.5">
                      <Text className="font-heading text-[13px] uppercase text-white" numberOfLines={1}>
                        {liker.firstName}
                      </Text>
                      {liker.isVerified ? (
                        <BadgeCheck size={12} color={colors.gold.DEFAULT} strokeWidth={2.6} />
                      ) : null}
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-44">
              <View className="flex-row flex-wrap justify-between">
                {Array.from({ length: Math.min(likersCount, 8) }).map((_, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInDown.delay(Math.min(index, 8) * 60).springify().damping(16)}
                    style={{ width: '48.2%', marginBottom: 12 }}
                  >
                    <View
                      className="overflow-hidden rounded-3xl border border-white/[0.12]"
                      style={{ aspectRatio: 0.8 }}
                    >
                      <PhotoPlaceholder seed={index + 3} style={{ flex: 1 }} />
                      <BlurView intensity={65} tint="dark" style={{ position: 'absolute', inset: 0 }} />
                      <View className="absolute inset-0 items-center justify-center">
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-white/[0.14]">
                          <Lock size={16} color="rgba(255,255,255,0.8)" strokeWidth={2} />
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </ScrollView>

            {/* CTA fixe façon maquette : débloquer tous les likes avec Premium. */}
            <View className="absolute inset-x-6 bottom-10 rounded-3xl border border-white/[0.14] bg-white/[0.08] p-4">
              <Text className="mb-0.5 text-center font-heading text-[13.5px] uppercase text-white">
                Vois qui craque pour toi
              </Text>
              <Text className="mb-3.5 text-center font-body text-[11.5px] text-white/50">
                Débloque tous les likes avec Premium
              </Text>
              <Pressable onPress={() => router.push('/premium/pricing')} className="active:opacity-90">
                <LinearGradient
                  colors={gradients.brand}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 999, paddingVertical: 14 }}
                >
                  <Text className="text-center font-heading text-[13px] uppercase tracking-wide text-white">
                    Passer à Premium
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
