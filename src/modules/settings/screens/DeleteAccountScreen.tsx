import { useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useAppError } from '@/shared/hooks/useAppError';
import { queryClient } from '@/shared/services/queryClient';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { authService } from '@/modules/auth/services/authService';
import { accountService } from '@/modules/settings/services/accountService';
import { colors } from '@/shared/constants/theme';

const CONSEQUENCES = [
  'Votre profil ne sera plus visible par les autres membres',
  'Vos matches et conversations seront perdus',
  'Votre abonnement Premium sera annulé sans remboursement',
];

const CONFIRM_WORD = 'SUPPRIMER';

export function DeleteAccountScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText.trim().toUpperCase() === CONFIRM_WORD;

  const deleteAccount = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Session invalide');
      await accountService.deactivateAccount(user.id);
      await authService.signOut();
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace('/(auth)/welcome');
    },
  });
  const deleteError = useAppError(deleteAccount.error);

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={200} color="rgba(180,30,20,0.09)" bottom={-40} right={-40} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 68, paddingBottom: 28 }}>
        <View className="mb-6 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
          </IconButton>
          <Text className="font-display text-[20px] uppercase text-ink">Supprimer le compte</Text>
          <View style={{ width: 44 }} />
        </View>

        <View className="mb-5 items-center">
          <View className="mb-3.5 h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-danger/30 bg-danger/[0.1]">
            <AlertTriangle size={28} color="#E85A4E" strokeWidth={1.7} />
          </View>
          <Text className="text-center font-display text-[24px] uppercase leading-none text-ink">
            Cette action est{'\n'}irréversible
          </Text>
        </View>

        <View className="mb-5 gap-2.5 rounded-2xl border border-danger/[0.18] bg-danger/[0.06] p-4">
          {CONSEQUENCES.map((item) => (
            <View key={item} className="flex-row items-start gap-2.5">
              <View className="mt-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
              <Text className="flex-1 font-body text-[12.5px] leading-[18px] text-ink-muted">{item}</Text>
            </View>
          ))}
        </View>

        <Text className="mb-2 font-heading-semibold text-[11px] uppercase tracking-widest text-ink-faint">
          Tapez {CONFIRM_WORD} pour confirmer
        </Text>
        <TextInput
          value={confirmText}
          onChangeText={setConfirmText}
          placeholder={CONFIRM_WORD}
          placeholderTextColor="rgba(26,8,4,0.2)"
          autoCapitalize="characters"
          className="mb-6 rounded-2xl border-[1.5px] border-danger/[0.22] bg-white/70 px-5 py-4 font-heading text-[15px] uppercase tracking-wide text-ink"
        />

        {deleteError ? (
          <View className="mb-4">
            <ErrorState error={deleteError} variant="inline" onRetry={() => deleteAccount.mutate()} />
          </View>
        ) : null}

        <Pressable
          disabled={!canDelete || deleteAccount.isPending}
          onPress={() => deleteAccount.mutate()}
          className="w-full items-center rounded-2xl bg-danger py-4"
          style={{ opacity: canDelete ? 1 : 0.4 }}
        >
          {deleteAccount.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="font-heading text-[14px] uppercase tracking-wide text-white">
              Supprimer définitivement mon compte
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
