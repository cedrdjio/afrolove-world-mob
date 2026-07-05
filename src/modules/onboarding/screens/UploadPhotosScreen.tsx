import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Plus, X } from 'lucide-react-native';
import { OnboardingLayout } from '@/modules/onboarding/components/OnboardingLayout';
import { OnboardingHeader } from '@/modules/onboarding/components/OnboardingHeader';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { useOnboardingStore } from '@/modules/onboarding/stores/onboardingStore';
import { colors } from '@/shared/constants/theme';

const SLOT_COUNT = 6;
const MIN_PHOTOS = 2;

export function UploadPhotosScreen() {
  const router = useRouter();
  const photos = useOnboardingStore((s) => s.photos);
  const setPhotos = useOnboardingStore((s) => s.setPhotos);
  const isValid = photos.length >= MIN_PHOTOS;

  const handleAddPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      aspect: [3, 4],
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <OnboardingLayout orbPosition="topLeft">
      <OnboardingHeader step={7} total={8} />

      <Text className="mb-1 font-display text-[34px] leading-none text-ink">Vos photos</Text>
      <Text className="mb-[18px] font-body text-[12.5px] leading-[19px] text-ink-muted">
        Soyez authentique. 3 photos = 4× plus de visibilité.
      </Text>

      <View className="mb-3.5 flex-1 flex-row flex-wrap gap-2.5">
        {Array.from({ length: SLOT_COUNT }).map((_, index) => {
          const uri = photos[index];
          if (uri) {
            return (
              <View
                key={index}
                style={{ width: '31%', aspectRatio: 3 / 4 }}
                className="overflow-hidden rounded-2xl"
              >
                <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                <View
                  pointerEvents="none"
                  style={{ position: 'absolute', inset: 0 }}
                  className="bg-black/[0.02]"
                />
                <Pressable
                  onPress={() => handleRemovePhoto(index)}
                  className="absolute right-1.5 top-1.5 h-[22px] w-[22px] items-center justify-center rounded-full bg-white/90"
                >
                  <X size={11} color={colors.ink.DEFAULT} />
                </Pressable>
                {index === 0 ? (
                  <View className="absolute bottom-1.5 left-1.5 rounded-full bg-brand px-2 py-1">
                    <Text className="font-heading text-[8px] text-white">Principal</Text>
                  </View>
                ) : null}
              </View>
            );
          }

          return (
            <Pressable
              key={index}
              onPress={handleAddPhoto}
              style={{ width: '31%', aspectRatio: 3 / 4 }}
              className="items-center justify-center rounded-2xl border-2 border-dashed border-brand/[0.28] bg-white/[0.62]"
            >
              <View className="mb-1.5 h-9 w-9 items-center justify-center rounded-full bg-brand/10">
                <Plus size={18} color={colors.brand.DEFAULT} />
              </View>
              {index === photos.length ? (
                <Text className="font-heading text-[9px] text-brand/60">Ajouter</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <Text className="mb-3.5 text-center font-body text-[11px] leading-4 text-ink/30">
        Glissez pour réorganiser · Min. {MIN_PHOTOS} photos requises
      </Text>

      <GradientButton label="Continuer" disabled={!isValid} onPress={() => router.push('/(onboarding)/lifestyle')} />
    </OnboardingLayout>
  );
}
