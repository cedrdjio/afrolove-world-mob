import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Plus, X, Star } from 'lucide-react-native';
import { EditScreenLayout } from '@/modules/edit-profile/components/EditScreenLayout';
import { colors } from '@/shared/constants/theme';

const SLOT_COUNT = 6;
const MIN_PHOTOS = 2;

export function EditPhotosScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);

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
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleRemove = (index: number) => setPhotos((prev) => prev.filter((_, i) => i !== index));

  const handleMakePrincipal = (index: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  };

  return (
    <EditScreenLayout
      title="Photos"
      subtitle="Faites glisser l'étoile pour définir votre photo principale."
      onSave={() => router.back()}
      saveDisabled={photos.length < MIN_PHOTOS}
      scrollable={false}
    >
      <View className="flex-1 flex-row flex-wrap gap-2.5">
        {Array.from({ length: SLOT_COUNT }).map((_, index) => {
          const uri = photos[index];
          if (uri) {
            return (
              <View key={index} style={{ width: '31%', aspectRatio: 3 / 4 }} className="overflow-hidden rounded-2xl">
                <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                <Pressable
                  onPress={() => handleRemove(index)}
                  className="absolute right-1.5 top-1.5 h-[22px] w-[22px] items-center justify-center rounded-full bg-white/90"
                >
                  <X size={11} color={colors.ink.DEFAULT} />
                </Pressable>
                {index === 0 ? (
                  <View className="absolute bottom-1.5 left-1.5 rounded-full bg-brand px-2 py-1">
                    <Text className="font-heading text-[8px] uppercase text-white">Principal</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleMakePrincipal(index)}
                    className="absolute bottom-1.5 left-1.5 h-[22px] w-[22px] items-center justify-center rounded-full bg-white/90"
                  >
                    <Star size={11} color={colors.gold.DEFAULT} />
                  </Pressable>
                )}
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
              <View className="h-9 w-9 items-center justify-center rounded-full bg-brand/10">
                <Plus size={18} color={colors.brand.DEFAULT} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </EditScreenLayout>
  );
}
