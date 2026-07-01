import { useState } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Plus, X, Star, RefreshCw } from 'lucide-react-native';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { Skeleton } from '@/shared/components/feedback';
import { colors } from '@/shared/constants/theme';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { usePhotoManagement } from '@/modules/profile/hooks/usePhotoManagement';
import { MIN_PHOTOS, MAX_PHOTOS, type ProfilePhoto } from '@/modules/profile/types/profile';
import { useAppError } from '@/shared/hooks/useAppError';

const GRID_GAP = 10;
const COLUMNS = 3;

async function pickImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.9,
    aspect: [3, 4],
    allowsEditing: true,
  });
  return result.canceled ? null : (result.assets[0]?.uri ?? null);
}

interface PhotoTileProps {
  photo: ProfilePhoto;
  index: number;
  columnWidth: number;
  rowHeight: number;
  uploadProgress: number | null;
  isBeingReplaced: boolean;
  onRemove: () => void;
  onReplace: () => void;
  onMakePrimary: () => void;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
  photoCount: number;
}

function PhotoTile({
  photo,
  index,
  columnWidth,
  rowHeight,
  uploadProgress,
  isBeingReplaced,
  onRemove,
  onReplace,
  onMakePrimary,
  onDragEnd,
  photoCount,
}: PhotoTileProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const stepX = columnWidth + GRID_GAP;
  const stepY = rowHeight + GRID_GAP;

  const finishDrag = (toIndex: number) => {
    onDragEnd(index, toIndex);
  };

  const pan = Gesture.Pan()
    .activateAfterLongPress(220)
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const deltaCol = Math.round(event.translationX / stepX);
      const deltaRow = Math.round(event.translationY / stepY);
      const rawIndex = index + deltaRow * COLUMNS + deltaCol;
      const targetIndex = Math.max(0, Math.min(photoCount - 1, rawIndex));

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      isDragging.value = false;
      if (targetIndex !== index) runOnJS(finishDrag)(targetIndex);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: isDragging.value ? 1.06 : 1 }],
    zIndex: isDragging.value ? 10 : 0,
    shadowOpacity: isDragging.value ? 0.25 : 0,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[{ width: columnWidth, height: rowHeight }, animatedStyle]}
        className="overflow-hidden rounded-2xl"
      >
        <Image
          source={{ uri: photo.url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={photo.id}
        />

        {isBeingReplaced && uploadProgress !== null ? (
          <View className="absolute inset-x-0 bottom-0 h-1.5 bg-black/20">
            <View className="h-1.5 bg-brand" style={{ width: `${uploadProgress}%` }} />
          </View>
        ) : null}

        <Pressable
          onPress={onRemove}
          className="absolute right-1.5 top-1.5 h-[22px] w-[22px] items-center justify-center rounded-full bg-white/90"
        >
          <X size={11} color={colors.ink.DEFAULT} />
        </Pressable>
        <Pressable
          onPress={onReplace}
          className="absolute right-1.5 top-8 h-[22px] w-[22px] items-center justify-center rounded-full bg-white/90"
        >
          <RefreshCw size={11} color={colors.ink.DEFAULT} />
        </Pressable>

        {photo.isPrimary ? (
          <View className="absolute bottom-1.5 left-1.5 rounded-full bg-brand px-2 py-1">
            <Text className="font-heading text-[8px] uppercase text-white">Principale</Text>
          </View>
        ) : (
          <Pressable
            onPress={onMakePrimary}
            className="absolute bottom-1.5 left-1.5 h-[22px] w-[22px] items-center justify-center rounded-full bg-white/90"
          >
            <Star size={11} color={colors.gold.DEFAULT} />
          </Pressable>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

export function EditPhotosScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const { addPhoto, replacePhoto, deletePhoto, reorderPhotos, uploadProgress } = usePhotoManagement();
  const [containerWidth, setContainerWidth] = useState(0);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [addingSlot, setAddingSlot] = useState(false);

  const photos = profileQuery.data?.photos ?? [];
  const isValid = photos.length >= MIN_PHOTOS;

  const columnWidth = containerWidth > 0 ? (containerWidth - GRID_GAP * (COLUMNS - 1)) / COLUMNS : 0;
  const rowHeight = columnWidth * (4 / 3);

  const handleLayout = (event: LayoutChangeEvent) => setContainerWidth(event.nativeEvent.layout.width);

  const handleAdd = async () => {
    const uri = await pickImage();
    if (!uri) return;
    setAddingSlot(true);
    addPhoto.mutate({ localUri: uri, position: photos.length }, { onSettled: () => setAddingSlot(false) });
  };

  const handleReplace = async (photoId: string) => {
    const uri = await pickImage();
    if (!uri) return;
    setReplacingId(photoId);
    replacePhoto.mutate({ photoId, localUri: uri }, { onSettled: () => setReplacingId(null) });
  };

  const handleDragEnd = (fromIndex: number, toIndex: number) => {
    const reordered = [...photos];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    reorderPhotos.mutate(reordered);
  };

  const mutationError = addPhoto.error ?? replacePhoto.error ?? deletePhoto.error ?? reorderPhotos.error;
  const appError = useAppError(mutationError);

  return (
    <EditScreenLayout
      title="Photos"
      subtitle={`Appui long pour réorganiser · ${MIN_PHOTOS} à ${MAX_PHOTOS} photos.`}
      onSave={() => router.back()}
      saveDisabled={!isValid}
      scrollable={false}
    >
      {appError ? (
        <View className="mb-3">
          <ErrorState error={appError} variant="inline" />
        </View>
      ) : null}

      <View className="flex-1 flex-row flex-wrap" style={{ gap: GRID_GAP }} onLayout={handleLayout}>
        {profileQuery.isPending || columnWidth === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} width={columnWidth || 100} height={rowHeight || 130} radius={16} />
            ))
          : photos.map((photo, index) => (
              <PhotoTile
                key={photo.id}
                photo={photo}
                index={index}
                columnWidth={columnWidth}
                rowHeight={rowHeight}
                photoCount={photos.length}
                uploadProgress={uploadProgress}
                isBeingReplaced={replacingId === photo.id}
                onRemove={() => deletePhoto.mutate(photo.id)}
                onReplace={() => handleReplace(photo.id)}
                onMakePrimary={() => reorderPhotos.mutate([photo, ...photos.filter((p) => p.id !== photo.id)])}
                onDragEnd={handleDragEnd}
              />
            ))}

        {!profileQuery.isPending && photos.length < MAX_PHOTOS && columnWidth > 0 ? (
          <Pressable
            onPress={handleAdd}
            disabled={addingSlot}
            style={{ width: columnWidth, height: rowHeight }}
            className="items-center justify-center rounded-2xl border-2 border-dashed border-brand/[0.28] bg-white/[0.62]"
          >
            <View className="mb-1.5 h-9 w-9 items-center justify-center rounded-full bg-brand/10">
              <Plus size={18} color={colors.brand.DEFAULT} />
            </View>
            {addingSlot && uploadProgress !== null ? (
              <Text className="font-heading text-[9px] uppercase text-brand/60">{uploadProgress}%</Text>
            ) : null}
          </Pressable>
        ) : null}
      </View>
    </EditScreenLayout>
  );
}
