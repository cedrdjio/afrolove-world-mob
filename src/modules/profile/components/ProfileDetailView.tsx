import { useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { MapPin, Heart, X, GraduationCap, Briefcase, Church, Ruler, ArrowLeft, Eye, Expand, Languages, Sparkles, Bookmark, Coffee, UserRound, Flag, UserX } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '@/shared/components/layout';
import { PhotoPlaceholder } from '@/shared/components/ui/PhotoPlaceholder';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { GlassCard } from '@/shared/components/ui/GlassCard';
import { VerifiedBadge } from '@/shared/components/ui/Badges';
import { Chip } from '@/shared/components/ui/Chip';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { colors } from '@/shared/constants/theme';
import { InfoRow } from '@/modules/profile/components/InfoRow';
import { useBlockUser } from '@/modules/reports/hooks/useModeration';
import type { Profile } from '@/modules/profile/types/profile';
import type { ProfileDisplayData } from '@/modules/profile/hooks/useProfileDisplayData';

const HERO_HEIGHT = 540;

function hashToSeed(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return hash;
}

function SectionTitle({ icon, children }: { icon?: React.ReactNode; children: string }) {
  return (
    <View className="mb-3 flex-row items-center gap-2.5">
      {icon ? (
        <View className="h-7 w-7 items-center justify-center rounded-[9px] bg-brand/[0.1]">{icon}</View>
      ) : null}
      <Text className="font-heading text-[12.5px] uppercase tracking-wide text-ink/55">{children}</Text>
    </View>
  );
}

interface ProfileDetailViewProps {
  profile: Profile;
  displayData: ProfileDisplayData;
  /** 'discovery' shows the like/report/block actions used when looking at
   *  someone else; 'preview' shows a "this is what others see" banner and
   *  no actions, for the user's own Profile Preview screen. */
  variant: 'discovery' | 'preview';
  /** Cartouches « compatibilité » / « points communs » de la maquette. */
  discoveryStats?: { compatibility: number; commonInterests: number };
  onGalleryPress: () => void;
  onLike?: () => void;
  /** Passer ce profil (dislike) depuis la fiche : enregistre le pass puis
   *  revient à la Découverte sur le profil suivant. */
  onPass?: () => void;
  /** Fourni uniquement quand un match existe déjà — ouvre la conversation. */
  onMessage?: () => void;
  /** Signet favoris (≠ like) — garder ce profil de côté. */
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

/** Fiche profil façon maquette 05 : identité sur la photo, contenu en
 *  cartes de verre sur le dégradé lavande, barre d'actions flottante. */
export function ProfileDetailView({
  profile,
  displayData,
  variant,
  onGalleryPress,
  onLike,
  onPass,
  isFavorite = false,
  onToggleFavorite,
}: ProfileDetailViewProps) {
  const router = useRouter();
  const [activePhoto, setActivePhoto] = useState(0);
  const blockUser = useBlockUser();
  const displayName = profile.firstName ?? '';

  // Confirmation avant blocage, puis retour visible de succès.
  const handleBlock = () => {
    Alert.alert(
      `Bloquer ${displayName} ?`,
      'Cette personne disparaîtra de vos découvertes, recherches et conversations, et ne pourra plus vous contacter.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Bloquer',
          style: 'destructive',
          onPress: () =>
            blockUser.mutate(profile.id, {
              onSuccess: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                Alert.alert('Profil bloqué', `${displayName} ne peut plus vous voir ni vous contacter.`);
                router.back();
              },
              onError: () => Alert.alert('Erreur', "Le blocage n'a pas pu être appliqué. Réessayez."),
            }),
        },
      ],
    );
  };

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-200, 0], [-60, 0], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [-200, 0], [1.3, 1], Extrapolation.CLAMP) },
    ],
  }));

  const stickyHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HERO_HEIGHT - 160, HERO_HEIGHT - 70], [0, 1], Extrapolation.CLAMP),
  }));

  const activePhotoUrl = profile.photos[activePhoto]?.url;
  const locationLine = [profile.city, profile.country].filter(Boolean).join(', ');
  // Rencontres diaspora : la distance se lit « à 5 200 km », pas en minutes.
  const distanceLabel =
    profile.distanceKm != null ? `à ${Math.round(profile.distanceKm).toLocaleString('fr-FR')} km` : null;

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream" />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: variant === 'discovery' ? 150 : 60 }}
      >
        <View style={{ height: HERO_HEIGHT }}>
          <Animated.View
            style={[
              { position: 'absolute', inset: 0, borderBottomLeftRadius: 34, borderBottomRightRadius: 34, overflow: 'hidden' },
              heroStyle,
            ]}
          >
            {activePhotoUrl ? (
              <Image
                source={{ uri: activePhotoUrl }}
                style={{ flex: 1 }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                recyclingKey={activePhotoUrl}
              />
            ) : (
              <PhotoPlaceholder seed={hashToSeed(profile.id)} style={{ flex: 1 }} showIcon iconSize={50} />
            )}
            <LinearGradient
              colors={['rgba(24,15,42,0.32)', 'transparent', 'transparent', 'rgba(24,15,42,0.9)']}
              locations={[0, 0.26, 0.5, 1]}
              style={{ position: 'absolute', inset: 0 }}
            />
          </Animated.View>

          {/* Tap zones first, indicators and buttons above them — the previous
              full-hero "open gallery" overlay swallowed every touch, making
              the photos impossible to browse. Left half = previous photo,
              right half = next; the gallery has its own button below. */}
          {profile.photos.length > 1 ? (
            <View style={{ position: 'absolute', inset: 0, flexDirection: 'row' }}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => setActivePhoto((i) => Math.max(0, i - 1))}
                accessibilityLabel="Photo précédente"
              />
              <Pressable
                style={{ flex: 1 }}
                onPress={() => setActivePhoto((i) => Math.min(profile.photos.length - 1, i + 1))}
                accessibilityLabel="Photo suivante"
              />
            </View>
          ) : (
            <Pressable onPress={onGalleryPress} style={{ position: 'absolute', inset: 0 }} />
          )}

          {profile.photos.length > 1 ? (
            <View className="absolute inset-x-[18px] flex-row gap-1.5" style={{ top: 108 }}>
              {profile.photos.map((photo, i) => (
                <Pressable key={photo.id} onPress={() => setActivePhoto(i)} className="flex-1" hitSlop={8}>
                  <View className={`h-[3px] rounded-full ${i === activePhoto ? 'bg-white/90' : 'bg-white/35'}`} />
                </Pressable>
              ))}
            </View>
          ) : null}

          {variant === 'preview' ? (
            <View className="absolute inset-x-[18px] flex-row items-center gap-2" style={{ top: 128 }}>
              <GlassSurface variant="dark" radius={999}>
                <View className="flex-row items-center gap-1.5 px-3.5 py-2">
                  <Eye size={12} color="#fff" />
                  <Text className="font-heading text-[11px] text-white">Aperçu public</Text>
                </View>
              </GlassSurface>
            </View>
          ) : null}

          {/* Identité sur la photo, comme la maquette. */}
          <View className="absolute inset-x-6" style={{ bottom: 52 }} pointerEvents="none">
            <View className="flex-row items-center gap-2">
              <Text className="font-display text-[34px] text-white">
                {displayName}
                {displayData.age != null ? `, ${displayData.age}` : ''}
              </Text>
              {profile.isVerified ? <VerifiedBadge tone="onDark" /> : null}
            </View>
            {locationLine || distanceLabel ? (
              <View className="mt-2.5 flex-row flex-wrap items-center gap-2">
                {locationLine ? (
                  <View className="flex-row items-center gap-1.5 rounded-full border border-white/[0.28] bg-white/[0.16] px-3 py-1.5">
                    <MapPin size={11} color="#fff" />
                    <Text className="font-heading-semibold text-[11px] text-white">{locationLine}</Text>
                  </View>
                ) : null}
                {distanceLabel ? (
                  <View className="rounded-full border border-white/[0.28] bg-white/[0.16] px-3 py-1.5">
                    <Text className="font-heading-semibold text-[11px] text-white/90">{distanceLabel}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          {profile.photos.length > 0 ? (
            <Pressable
              onPress={onGalleryPress}
              className="absolute right-[18px]"
              style={{ bottom: 58 }}
              accessibilityLabel="Ouvrir la galerie"
            >
              <GlassSurface variant="dark" radius={13} style={{ width: 40, height: 40 }}>
                <View className="h-10 w-10 items-center justify-center">
                  <Expand size={16} color="#fff" strokeWidth={2} />
                </View>
              </GlassSurface>
            </Pressable>
          ) : null}
        </View>

        <View className="px-5 pt-5" style={{ gap: 14 }}>
          {profile.bio ? (
            <GlassCard>
              <SectionTitle icon={<Sparkles size={13} color={colors.brand.DEFAULT} />}>À propos</SectionTitle>
              <Text className="font-body text-[13.5px] leading-[21px] text-ink-muted">{profile.bio}</Text>
            </GlassCard>
          ) : null}

          {displayData.interestLabels.length > 0 ? (
            <GlassCard>
              <SectionTitle icon={<Heart size={13} color={colors.brand.DEFAULT} />}>Centres d'intérêt</SectionTitle>
              <View className="flex-row flex-wrap gap-2">
                {displayData.interestLabels.map((label) => (
                  <Chip key={label} label={label} selected size="sm" />
                ))}
              </View>
            </GlassCard>
          ) : null}

          {displayData.languageLabels.length > 0 ? (
            <GlassCard>
              <SectionTitle icon={<Languages size={13} color={colors.brand.DEFAULT} />}>Langues</SectionTitle>
              <View className="flex-row flex-wrap gap-2">
                {displayData.languageLabels.map((label) => (
                  <Chip key={label} label={label} size="sm" />
                ))}
              </View>
            </GlassCard>
          ) : null}

          <GlassCard padding={0}>
            <View className="px-[18px] pt-[18px]">
              <SectionTitle icon={<Coffee size={13} color={colors.brand.DEFAULT} />}>Mode de vie</SectionTitle>
            </View>
            {displayData.lifestyleRows.map((item, i) => (
              <View
                key={item.label}
                className={`flex-row items-center justify-between px-[18px] py-3.5 ${
                  i === displayData.lifestyleRows.length - 1 ? 'pb-[18px]' : 'border-b border-ink/[0.06]'
                }`}
              >
                <Text className="font-heading-semibold text-[13px] text-ink">{item.label}</Text>
                <Text className="font-body-medium text-[12.5px] text-ink-muted">{item.value}</Text>
              </View>
            ))}
          </GlassCard>

          <GlassCard padding={0}>
            <View className="px-[18px] pt-[18px]">
              <SectionTitle icon={<UserRound size={13} color={colors.brand.DEFAULT} />}>Essentiel</SectionTitle>
            </View>
            <View className="px-[18px] pb-1.5">
              <InfoRow
                icon={<Church size={15} color={colors.brand.DEFAULT} />}
                label="Religion"
                value={displayData.religionLabel ?? '—'}
              />
              <InfoRow
                icon={<GraduationCap size={15} color={colors.brand.DEFAULT} />}
                label="Éducation"
                value={displayData.educationLabel ?? '—'}
              />
              <InfoRow
                icon={<Briefcase size={15} color={colors.brand.DEFAULT} />}
                label="Profession"
                value={profile.profession ?? '—'}
              />
              <InfoRow
                icon={<Ruler size={15} color={colors.brand.DEFAULT} />}
                label="Taille"
                value={profile.heightCm ? `${profile.heightCm} cm` : '—'}
                isLast
              />
            </View>
          </GlassCard>

          {/* Sécurité : signaler / bloquer, désormais visibles en bas de fiche
              (plus dans un menu « … » caché). */}
          {variant === 'discovery' ? (
            <View className="mt-1 flex-row gap-3">
              <Pressable
                onPress={() => router.push(`/reports/${profile.id}`)}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-danger/25 bg-danger/[0.06] py-3.5"
                accessibilityLabel="Signaler ce profil"
              >
                <Flag size={15} color={colors.danger} />
                <Text className="font-heading-semibold text-[13px] text-danger">Signaler</Text>
              </Pressable>
              <Pressable
                onPress={handleBlock}
                disabled={blockUser.isPending}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-ink/15 bg-ink/[0.04] py-3.5"
                accessibilityLabel="Bloquer ce profil"
              >
                {blockUser.isPending ? (
                  <ActivityIndicator size="small" color={colors.ink.muted} />
                ) : (
                  <UserX size={15} color={colors.ink.muted} />
                )}
                <Text className="font-heading-semibold text-[13px] text-ink-muted">Bloquer</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Animated.ScrollView>

      <View className="absolute inset-x-0 top-14 flex-row items-center justify-between px-[18px]">
        <Pressable onPress={() => router.back()}>
          <GlassSurface variant="dark" radius={13} style={{ width: 42, height: 42 }}>
            <View className="h-[42px] w-[42px] items-center justify-center">
              <ArrowLeft size={18} color="#fff" strokeWidth={2} />
            </View>
          </GlassSurface>
        </Pressable>
        <Animated.View style={[{ position: 'absolute', left: 60, right: 60 }, stickyHeaderStyle]}>
          <Text className="text-center font-display text-[17px] text-ink">{displayName}</Text>
        </Animated.View>
        <View style={{ width: 42 }} />
      </View>

      {variant === 'discovery' ? (
        <View className="absolute inset-x-4 bottom-6">
          <GlassSurface
            variant="lightStrong"
            radius={30}
            style={{
              shadowColor: colors.ink.soft,
              shadowOpacity: 0.18,
              shadowRadius: 26,
              shadowOffset: { width: 0, height: 10 },
              elevation: 8,
            }}
          >
            <View className="flex-row items-center gap-3 p-3">
              <Pressable onPress={onPass ?? (() => router.back())} accessibilityLabel="Passer">
                <GlassSurface variant="light" radius={24} style={{ width: 52, height: 52 }}>
                  <View className="h-[52px] w-[52px] items-center justify-center">
                    <X size={20} color={colors.ink.muted} />
                  </View>
                </GlassSurface>
              </Pressable>
              {onToggleFavorite ? (
                <Pressable onPress={onToggleFavorite} accessibilityLabel="Ajouter aux favoris">
                  <GlassSurface variant="light" radius={24} style={{ width: 52, height: 52 }}>
                    <View className="h-[52px] w-[52px] items-center justify-center">
                      <Bookmark
                        size={19}
                        color={colors.brand.DEFAULT}
                        fill={isFavorite ? colors.brand.DEFAULT : 'none'}
                      />
                    </View>
                  </GlassSurface>
                </Pressable>
              ) : null}
              <GradientButton
                label="J'aime"
                icon={<Heart size={16} color="#fff" fill="#fff" />}
                iconPosition="left"
                onPress={onLike}
                size="md"
                style={{ flex: 1 }}
              />
            </View>
          </GlassSurface>
        </View>
      ) : null}
    </View>
  );
}
