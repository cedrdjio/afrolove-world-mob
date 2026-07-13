import { useCallback, useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ban, Trash2, Flag } from 'lucide-react-native';
import { colors } from '@/shared/constants/theme';
import { useBlockUser, useUnmatch } from '@/modules/reports/hooks/useModeration';
import type { Conversation } from '@/modules/messaging/types/messaging';

interface ConversationActionSheetProps {
  conversation: Conversation;
  onClose: () => void;
}

/**
 * Monté uniquement quand la feuille est ouverte (le parent conditionne le
 * rendu) : un BottomSheet fermé mais monté interceptait tous les touchers de
 * l'écran sur la nouvelle architecture RN. onClose démonte la feuille.
 */
export function ConversationActionSheet({ conversation, onClose }: ConversationActionSheetProps) {
  const router = useRouter();
  const blockUser = useBlockUser();
  const unmatch = useUnmatch();
  const snapPoints = useMemo(() => ['34%'], []);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
    ),
    [],
  );

  const handleBlock = () => {
    Alert.alert(
      `Bloquer ${conversation.partnerFirstName} ?`,
      'Cette personne disparaîtra de vos conversations et découvertes, et ne pourra plus vous contacter.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Bloquer',
          style: 'destructive',
          onPress: () =>
            blockUser.mutate(conversation.partnerId, {
              onSuccess: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                Alert.alert('Profil bloqué', `${conversation.partnerFirstName} ne peut plus vous contacter.`);
              },
              onSettled: () => onClose(),
            }),
        },
      ],
    );
  };

  const handleUnmatch = () => {
    Alert.alert(
      'Supprimer la conversation ?',
      'Le match et tous les messages seront définitivement supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () =>
            unmatch.mutate(conversation.matchId, {
              onSettled: () => onClose(),
            }),
        },
      ],
    );
  };

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.cream.DEFAULT, borderRadius: 28 }}
      handleIndicatorStyle={{ backgroundColor: 'rgba(46,36,64,0.16)', width: 40 }}
    >
      <BottomSheetView className="px-6 pb-8 pt-2">
        <Text className="mb-3 font-heading text-[11px] text-ink/35">
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
          <Text className="font-heading-semibold text-[14px] text-ink">Bloquer</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            onClose();
            router.push(`/reports/${conversation.partnerId}`);
          }}
          className="flex-row items-center gap-3.5 border-b border-ink/[0.06] py-4"
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-danger/10">
            <Flag size={16} color={colors.danger} />
          </View>
          <Text className="font-heading-semibold text-[14px] text-ink">Signaler</Text>
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
          <Text className="font-heading-semibold text-[14px] text-danger">
            Supprimer la conversation
          </Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}
