import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ban, ArrowLeft } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Avatar } from '@/shared/components/ui/Avatar';
import { EmptyState } from '@/shared/components/feedback';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useAppError } from '@/shared/hooks/useAppError';
import { useBlockedProfiles, useUnblockUser } from '@/modules/reports/hooks/useModeration';
import type { BlockedProfile } from '@/modules/reports/services/moderationService';
import { colors } from '@/shared/constants/theme';

export function BlockedUsersScreen() {
  const router = useRouter();
  const blockedQuery = useBlockedProfiles();
  const unblock = useUnblockUser();
  const blockedError = useAppError(blockedQuery.error);
  const [pendingUnblock, setPendingUnblock] = useState<BlockedProfile | null>(null);

  const users = blockedQuery.data ?? [];

  const confirmUnblock = () => {
    if (!pendingUnblock) return;
    unblock.mutate(pendingUnblock.id, { onSettled: () => setPendingUnblock(null) });
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={210} color="rgba(106,79,192,0.08)" bottom={-40} left={-40} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 68, paddingBottom: 28 }}>
        <View className="mb-6 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
          </IconButton>
          <Text className="font-display text-[20px] uppercase text-ink">Profils bloqués</Text>
          <View style={{ width: 44 }} />
        </View>

        {blockedQuery.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
          </View>
        ) : blockedError ? (
          <View className="flex-1 justify-center">
            <ErrorState error={blockedError} variant="inline" onRetry={() => blockedQuery.refetch()} />
          </View>
        ) : users.length === 0 ? (
          <EmptyState
            icon={<Ban size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
            title="Aucun profil bloqué"
            description="Les profils que vous bloquez apparaîtront ici."
          />
        ) : pendingUnblock ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="mb-2.5 text-center font-display text-[24px] uppercase leading-none text-ink">
              Débloquer {pendingUnblock.firstName} ?
            </Text>
            <Text className="mb-8 text-center font-body text-[13px] leading-[20px] text-ink-muted">
              Cette personne pourra à nouveau voir votre profil et vous contacter.
            </Text>
            <Pressable
              onPress={confirmUnblock}
              disabled={unblock.isPending}
              className="mb-3 w-full items-center rounded-2xl bg-brand py-4"
            >
              {unblock.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-heading text-[13px] uppercase tracking-wide text-white">Débloquer</Text>
              )}
            </Pressable>
            <Pressable onPress={() => setPendingUnblock(null)}>
              <Text className="font-body-medium text-[13px] text-ink-muted">Annuler</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).springify().damping(17)}>
                <View className="mb-2 flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5">
                  <Avatar source={item.avatarUrl ?? undefined} seed={item.firstName} size={48} />
                  <View className="flex-1">
                    <Text className="mb-0.5 font-heading text-[14px] uppercase text-ink">{item.firstName}</Text>
                    <Text className="font-body text-[11px] text-ink-muted">
                      Bloqué le {new Date(item.blockedAt).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setPendingUnblock(item)}
                    className="rounded-xl bg-brand/10 px-3.5 py-2 active:opacity-70"
                  >
                    <Text className="font-heading text-[11px] uppercase text-brand">Débloquer</Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}
          />
        )}
      </View>
    </View>
  );
}
