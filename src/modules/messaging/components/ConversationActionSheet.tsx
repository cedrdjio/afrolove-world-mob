import { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Archive, Trash2, Flag } from 'lucide-react-native';
import { colors } from '@/shared/constants/theme';
import type { MockConversation } from '@/modules/matches/constants/mockMatches';

interface ConversationActionSheetProps {
  conversation: MockConversation | null;
}

export const ConversationActionSheet = forwardRef<BottomSheet, ConversationActionSheetProps>(
  ({ conversation }, ref) => {
    const router = useRouter();
    const snapPoints = useMemo(() => ['34%'], []);

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
      ),
      [],
    );

    if (!conversation) return null;

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
          <Text className="mb-3 font-heading text-[11px] uppercase tracking-widest text-ink/35">
            {conversation.name}
          </Text>
          <Pressable className="flex-row items-center gap-3.5 border-b border-ink/[0.06] py-4">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-brand/10">
              <Archive size={16} color={colors.brand.DEFAULT} />
            </View>
            <Text className="font-heading-semibold text-[14px] uppercase text-ink">Archiver</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(`/reports/${conversation.id}`)}
            className="flex-row items-center gap-3.5 border-b border-ink/[0.06] py-4"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-danger/10">
              <Flag size={16} color={colors.danger} />
            </View>
            <Text className="font-heading-semibold text-[14px] uppercase text-ink">Signaler</Text>
          </Pressable>
          <Pressable className="flex-row items-center gap-3.5 py-4">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-danger/10">
              <Trash2 size={16} color={colors.danger} />
            </View>
            <Text className="font-heading-semibold text-[14px] uppercase text-danger">
              Supprimer la conversation
            </Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);
ConversationActionSheet.displayName = 'ConversationActionSheet';
