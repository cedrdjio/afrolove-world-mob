import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ban, RefreshCcw, UserX } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { GhostButton } from '@/shared/components/ui/GhostButton';
import { queryClient } from '@/shared/services/queryClient';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useProfileQuery, PROFILE_QUERY_KEY } from '@/modules/profile/hooks/useProfileQuery';
import { authService } from '@/modules/auth/services/authService';
import { accountService } from '@/modules/settings/services/accountService';
import { colors } from '@/shared/constants/theme';

/**
 * The "voyant" for non-active accounts. A banned member is told so and can
 * only contact support or sign out — the DB trigger makes self-unbanning
 * impossible even through the raw API. A self-deleted member may reactivate.
 */
export function AccountStatusScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const profileQuery = useProfileQuery();

  const status = profileQuery.data?.accountStatus;
  const isBanned = status === 'banned';

  const reactivate = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Session invalide');
      await accountService.reactivateAccount(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, user?.id] });
      router.replace('/(auth)/resolving');
    },
  });

  const signOut = async () => {
    await authService.signOut().catch(() => {});
    queryClient.clear();
    router.replace('/(auth)/welcome');
  };

  if (!profileQuery.data) {
    return (
      <View className="flex-1 items-center justify-center bg-deep">
        <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={260} color={isBanned ? 'rgba(180,30,20,0.18)' : 'rgba(201,134,42,0.14)'} top={120} left={-40} duration={9000} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-8">
        <Animated.View
          entering={FadeInDown.springify().damping(14)}
          className={`mb-7 h-24 w-24 items-center justify-center rounded-full border-[1.5px] ${
            isBanned ? 'border-danger/30 bg-danger/[0.12]' : 'border-gold/30 bg-gold/[0.1]'
          }`}
        >
          {isBanned ? (
            <Ban size={40} color="#E85A4E" strokeWidth={1.6} />
          ) : (
            <UserX size={40} color={colors.gold.DEFAULT} strokeWidth={1.6} />
          )}
        </Animated.View>

        <Text className="mb-3 text-center font-display-black text-[28px] uppercase text-white">
          {isBanned ? 'Compte suspendu' : 'Compte désactivé'}
        </Text>
        <Text className="mb-6 text-center font-body text-[13.5px] leading-[21px] text-white/50">
          {isBanned
            ? 'Votre compte a été suspendu pour non-respect de nos conditions d’utilisation.'
            : 'Vous avez désactivé votre compte. Vos données sont conservées et votre profil est invisible.'}
        </Text>

        {isBanned && profileQuery.data.statusReason ? (
          <View className="mb-8 w-full rounded-2xl border border-white/[0.14] bg-white/[0.08] p-4">
            <Text className="mb-1 font-heading text-[10px] uppercase tracking-widest text-white/40">Motif</Text>
            <Text className="font-body text-[12.5px] leading-[18px] text-white/80">
              {profileQuery.data.statusReason}
            </Text>
          </View>
        ) : null}

        {!isBanned ? (
          <GradientButton
            label="Réactiver mon compte"
            icon={<RefreshCcw size={15} color="#fff" />}
            iconPosition="left"
            loading={reactivate.isPending}
            onPress={() => reactivate.mutate()}
            style={{ width: '100%', marginBottom: 12 }}
          />
        ) : null}
        <GhostButton label="Se déconnecter" tone="onDark" onPress={signOut} />
      </View>
    </View>
  );
}
