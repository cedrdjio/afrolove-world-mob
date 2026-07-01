import { useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import type BottomSheet from '@gorhom/bottom-sheet';
import { MoreHorizontal, MapPin, Heart, X, GraduationCap, Briefcase, Church, Ruler, ArrowLeft, Eye } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PhotoPlaceholder } from '@/shared/components/ui/PhotoPlaceholder';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { VerifiedBadge } from '@/shared/components/ui/Badges';
import { Chip } from '@/shared/components/ui/Chip';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { colors } from '@/shared/constants/theme';
import { InfoRow } from '@/modules/profile/components/InfoRow';
import { ProfileActionSheet } from '@/modules/profile/components/ProfileActionSheet';
import type { Profile } from '@/modules/profile/types/profile';
import type { ProfileDisplayData } from '@/modules/profile/hooks/useProfileDisplayData';

const HERO_HEIGHT = 520;

function hashToSeed(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return hash;
}

interface ProfileDetailViewProps {
  profile: Profile;
  displayData: ProfileDisplayData;
  /** 'discovery' shows the like/report/block actions used when looking at
   *  someone else; 'preview' shows a "this is what others see" banner and
   *  no actions, for the user's own Profile Preview screen. */
  variant: 'discovery' | 'preview';
  onGalleryPress: () => void;
  onLike?: () => void;
}

export function ProfileDetailView({ profile, displayData, variant, onGalleryPress, onLike }: ProfileDetailViewProps) {
  const router = useRouter();
  const [activePhoto, setActivePhoto] = useState(0);
  const sheetRef = useRef<BottomSheet>(null);
  const displayName = profile.firstName ?? '';

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
    opacity: interpolate(scrollY.value, [HERO_HEIGHT - 140, HERO_HEIGHT - 60], [0, 1], Extrapolation.CLAMP),
  }));

  const activePhotoUrl = profile.photos[activePhoto]?.url;

  return (
    <View className="flex-1 bg-cream">
      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>
        <View style={{ height: HERO_HEIGHT }}>
          <Animated.View style={[{ position: 'absolute', inset: 0 }, heroStyle]}>
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
          </Animated.View>
          <LinearGradient
            colors={['rgba(0,0,0,0.18)', 'transparent', 'transparent', 'rgba(8,3,1,0.95)']}
            locations={[0, 0.25, 0.55, 1]}
            style={{ position: 'absolute', inset: 0 }}
          />

          {profile.photos.length > 1 ? (
            <View className="absolute inset-x-[18px] flex-row gap-1.5" style={{ top: 108 }}>
              {profile.photos.map((photo, i) => (
                <Pressable key={photo.id} onPress={() => setActivePhoto(i)} className="flex-1">
                  <View className={`h-[3px] rounded-full ${i === activePhoto ? 'bg-white/90' : 'bg-white/35'}`} />
                </Pressable>
              ))}
            </View>
          ) : null}

          {variant === 'preview' ? (
            <View className="absolute inset-x-[18px] flex-row items-center gap-2" style={{ top: 128 }}>
              <View className="flex-row items-center gap-1.5 rounded-full border border-white/[0.28] bg-white/[0.18] px-3.5 py-2">
                <Eye size={12} color="#fff" />
                <Text className="font-heading text-[11px] uppercase text-white">Aperçu public</Text>
              </View>
            </View>
          ) : null}

          <Pressable onPress={onGalleryPress} style={{ position: 'absolute', inset: 0 }} />
        </View>

        <View className="rounded-t-[32px] bg-cream px-6 pb-10 pt-6" style={{ marginTop: -32 }}>
          <View className="mb-1.5 flex-row items-center justify-between">
            <View className="flex-row items-baseline gap-2">
              <Text className="font-display text-[32px] text-ink">{displayName},</Text>
              <Text className="font-display-semibold text-[26px] text-ink-muted">{displayData.age ?? '—'}</Text>
            </View>
            <VerifiedBadge tone="chip" />
          </View>
          {profile.city ? (
            <View className="mb-5 flex-row items-center gap-1.5">
              <MapPin size={13} color={colors.ink.muted} />
              <Text className="font-body-medium text-[13px] text-ink-muted">
                {profile.city}
                {profile.country ? `, ${profile.country}` : ''}
              </Text>
            </View>
          ) : null}

          {profile.bio ? (
            <>
              <Text className="mb-2.5 font-heading text-[11px] uppercase tracking-widest text-ink/40">À propos</Text>
              <Text className="mb-6 font-body text-[13.5px] leading-[21px] text-ink-muted">{profile.bio}</Text>
            </>
          ) : null}

          {displayData.interestLabels.length > 0 ? (
            <>
              <Text className="mb-2.5 font-heading text-[11px] uppercase tracking-widest text-ink/40">Passions</Text>
              <View className="mb-6 flex-row flex-wrap gap-2">
                {displayData.interestLabels.map((label) => (
                  <Chip key={label} label={label} selected />
                ))}
              </View>
            </>
          ) : null}

          {displayData.languageLabels.length > 0 ? (
            <>
              <Text className="mb-2.5 font-heading text-[11px] uppercase tracking-widest text-ink/40">Langues</Text>
              <View className="mb-6 flex-row flex-wrap gap-2">
                {displayData.languageLabels.map((label) => (
                  <Chip key={label} label={label} />
                ))}
              </View>
            </>
          ) : null}

          <Text className="mb-2.5 font-heading text-[11px] uppercase tracking-widest text-ink/40">Mode de vie</Text>
          <View className="mb-6 overflow-hidden rounded-2xl border-[1.5px] border-white/90 bg-white/70">
            {displayData.lifestyleRows.map((item, i) => (
              <View
                key={item.label}
                className={`flex-row items-center justify-between px-4 py-3.5 ${
                  i === displayData.lifestyleRows.length - 1 ? '' : 'border-b border-ink/[0.06]'
                }`}
              >
                <Text className="font-heading-semibold text-[13px] uppercase text-ink">{item.label}</Text>
                <Text className="font-body-medium text-[12.5px] text-ink-muted">{item.value}</Text>
              </View>
            ))}
          </View>

          <View className="overflow-hidden rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4">
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
          <Text className="text-center font-display text-[17px] uppercase text-ink">{displayName}</Text>
        </Animated.View>
        {variant === 'discovery' ? (
          <Pressable onPress={() => sheetRef.current?.expand()}>
            <GlassSurface variant="dark" radius={13} style={{ width: 42, height: 42 }}>
              <View className="h-[42px] w-[42px] items-center justify-center">
                <MoreHorizontal size={17} color="#fff" />
              </View>
            </GlassSurface>
          </Pressable>
        ) : (
          <View style={{ width: 42 }} />
        )}
      </View>

      {variant === 'discovery' ? (
        <View className="absolute inset-x-0 bottom-0 flex-row gap-3 bg-cream px-6 pb-9 pt-4">
          <Pressable onPress={() => router.back()}>
            <GlassSurface
              variant="lightStrong"
              radius={26}
              style={{ width: 52, height: 52, shadowColor: colors.ink.soft, shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } }}
            >
              <View className="h-[52px] w-[52px] items-center justify-center">
                <X size={20} color={colors.ink.muted} />
              </View>
            </GlassSurface>
          </Pressable>
          <GradientButton
            label="J'aime"
            icon={<Heart size={16} color="#fff" fill="#fff" />}
            iconPosition="left"
            onPress={onLike}
            style={{ flex: 1 }}
          />
        </View>
      ) : null}

      {variant === 'discovery' ? (
        <ProfileActionSheet ref={sheetRef} profileId={profile.id} profileName={displayName} />
      ) : null}
    </View>
  );
}
