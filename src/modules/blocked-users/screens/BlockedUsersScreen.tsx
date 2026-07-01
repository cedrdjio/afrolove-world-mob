import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ban, ArrowLeft } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Avatar } from '@/shared/components/ui/Avatar';
import { EmptyState } from '@/shared/components/feedback';
import { MOCK_BLOCKED_USERS, type BlockedUser } from '@/modules/blocked-users/constants/mockBlockedUsers';
import { colors } from '@/shared/constants/theme';

export function BlockedUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<BlockedUser[]>(MOCK_BLOCKED_USERS);
  const [pendingUnblock, setPendingUnblock] = useState<BlockedUser | null>(null);

  const confirmUnblock = () => {
    if (!pendingUnblock) return;
    setUsers((prev) => prev.filter((u) => u.id !== pendingUnblock.id));
    setPendingUnblock(null);
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={210} color="rgba(200,96,64,0.08)" bottom={-40} left={-40} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 68, paddingBottom: 28 }}>
        <View className="mb-6 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
          </IconButton>
          <Text className="font-display text-[20px] uppercase text-ink">Profils bloqués</Text>
          <View style={{ width: 44 }} />
        </View>

        {users.length === 0 ? (
          <EmptyState
            icon={<Ban size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
            title="Aucun profil bloqué"
            description="Les profils que vous bloquez apparaîtront ici."
          />
        ) : pendingUnblock ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="mb-2.5 text-center font-display text-[24px] uppercase leading-none text-ink">
              Débloquer {pendingUnblock.name} ?
            </Text>
            <Text className="mb-8 text-center font-body text-[13px] leading-[20px] text-ink-muted">
              Cette personne pourra à nouveau voir votre profil et vous contacter.
            </Text>
            <Pressable onPress={confirmUnblock} className="mb-3 w-full items-center rounded-2xl bg-brand py-4">
              <Text className="font-heading text-[13px] uppercase tracking-wide text-white">Débloquer</Text>
            </Pressable>
            <Pressable onPress={() => setPendingUnblock(null)}>
              <Text className="font-body-medium text-[13px] text-ink-muted">Annuler</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="mb-2 flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5">
                <Avatar seed={item.name} size={48} />
                <View className="flex-1">
                  <Text className="mb-0.5 font-heading text-[14px] uppercase text-ink">{item.name}</Text>
                  <Text className="font-body text-[11px] text-ink-muted">Bloqué le {item.blockedOn}</Text>
                </View>
                <Pressable onPress={() => setPendingUnblock(item)} className="rounded-xl bg-brand/10 px-3.5 py-2">
                  <Text className="font-heading text-[11px] uppercase text-brand">Débloquer</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
