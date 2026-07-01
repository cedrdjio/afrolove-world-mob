import { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, Pressable, Share } from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Flag, UserX, Share2 } from 'lucide-react-native';
import { colors } from '@/shared/constants/theme';

interface ProfileActionSheetProps {
  profileId: string;
  profileName: string;
}

export const ProfileActionSheet = forwardRef<BottomSheet, ProfileActionSheetProps>(
  ({ profileId, profileName }, ref) => {
    const router = useRouter();
    const snapPoints = useMemo(() => ['32%'], []);

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
      ),
      [],
    );

    const handleShare = () => {
      Share.share({ message: `Découvre le profil de ${profileName} sur AfroLove World.` }).catch(() => {});
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.cream.DEFAULT, borderRadius: 28 }}
        handleIndicatorStyle={{ backgroundColor: 'rgba(26,8,4,0.16)', width: 40 }}
      >
        <BottomSheetView className="px-6 pb-8 pt-2">
          <Pressable
            onPress={() => router.push(`/reports/${profileId}`)}
            className="flex-row items-center gap-3.5 border-b border-ink/[0.06] py-4"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-danger/10">
              <Flag size={16} color={colors.danger} />
            </View>
            <Text className="font-heading-semibold text-[14px] uppercase text-ink">Signaler</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(`/blocked-users?block=${profileId}`)}
            className="flex-row items-center gap-3.5 border-b border-ink/[0.06] py-4"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-danger/10">
              <UserX size={16} color={colors.danger} />
            </View>
            <Text className="font-heading-semibold text-[14px] uppercase text-ink">Bloquer</Text>
          </Pressable>
          <Pressable onPress={handleShare} className="flex-row items-center gap-3.5 py-4">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-brand/10">
              <Share2 size={16} color={colors.brand.DEFAULT} />
            </View>
            <Text className="font-heading-semibold text-[14px] uppercase text-ink">Partager</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);
ProfileActionSheet.displayName = 'ProfileActionSheet';
