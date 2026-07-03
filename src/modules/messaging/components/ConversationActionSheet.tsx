import { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ban, Trash2, Flag } from 'lucide-react-native';
import { colors } from '@/shared/constants/theme';
import { useBlockUser, useUnmatch } from '@/modules/reports/hooks/useModeration';
import type { Conversation } from '@/modules/messaging/types/messaging';

interface ConversationActionSheetProps {
  conversation: Conversation | null;
}

export const ConversationActionSheet = forwardRef<BottomSheet, ConversationActionSheetProps>(
  ({ conversation }, ref) => {
    const router = useRouter();
    const blockUser = useBlockUser();
    const unmatch = useUnmatch();
    const snapPoints = useMemo(() => ['34%'], []);

    const close = useCallback(() => {
      (ref as React.RefObject<BottomSheet | null>)?.current?.close();
    }, [ref]);

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
      ),
      [],
    );

    if (!conversation) return null;

    const handleBlock = () => {
      blockUser.mutate(conversation.partnerId, { onSettled: close });
    };

    const handleUnmatch = () => {
      unmatch.mutate(conversation.matchId, { onSettled: close });
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.cream.DEFAULT, borderRadius: 28 }}
        handleIndicatorStyle={{ backgroundColor: 'rgba(46,36,64,0.16)', width: 40 }}
      >
        <BottomSheetView className="px-6 pb-8 pt-2">
          <Text className="mb-3 font-heading text-[11px] uppercase tracking-widest text-ink/35">
            {conversation.partnerFirstName}
          </Text>
          <Pressable
            onPress={handleBlock}
            disabled={blockUser.isPending}
            className="flex-row items-center gap-3.5 border-b border-ink/[0.06] py-4"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-danger/10">
              {blockUser.isPending ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <Ban size={16} color={colors.danger} />
              )}
            </View>
            <Text className="font-heading-semibold text-[14px] uppercase text-ink">Bloquer</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              close();
              router.push(`/reports/${conversation.partnerId}`);
            }}
            className="flex-row items-center gap-3.5 border-b border-ink/[0.06] py-4"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-danger/10">
              <Flag size={16} color={colors.danger} />
            </View>
            <Text className="font-heading-semibold text-[14px] uppercase text-ink">Signaler</Text>
          </Pressable>
          <Pressable
            onPress={handleUnmatch}
            disabled={unmatch.isPending}
            className="flex-row items-center gap-3.5 py-4"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-danger/10">
              {unmatch.isPending ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <Trash2 size={16} color={colors.danger} />
              )}
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
