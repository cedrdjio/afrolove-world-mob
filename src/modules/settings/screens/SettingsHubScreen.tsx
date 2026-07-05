import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Lock, Bell, Eye, Ban } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { Avatar } from '@/shared/components/ui/Avatar';
import { GhostButton } from '@/shared/components/ui/GhostButton';
import { SettingsRow } from '@/shared/components/ui/SettingsRow';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { calculateAge } from '@/modules/profile/types/profile';
import { colors } from '@/shared/constants/theme';

export function SettingsHubScreen() {
  const router = useRouter();
  const profile = useProfileQuery().data;

  const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Mon profil';
  const subtitle = [
    [profile?.city, profile?.country].filter(Boolean).join(', '),
    profile?.birthDate ? `${calculateAge(profile.birthDate)} ans` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={220} color="rgba(106,79,192,0.08)" top={-50} right={-50} duration={9500} />
      </ScreenBackground>

      <ScrollView contentContainerClassName="px-6 pb-10" style={{ paddingTop: 64 }} showsVerticalScrollIndicator={false}>
        <Text className="mb-5 font-display text-[28px] text-ink">Paramètres</Text>

        <View className="mb-[22px] flex-row items-center gap-3.5 rounded-3xl border-[1.5px] border-white/[0.92] bg-white/[0.78] px-5 py-[18px]">
          <Avatar source={profile?.avatarUrl ?? undefined} seed={profile?.firstName ?? ''} size={62} />
          <View className="flex-1">
            <Text className="mb-0.5 font-heading text-[17px] text-ink">{displayName}</Text>
            {subtitle ? <Text className="font-body text-[12px] text-ink-muted">{subtitle}</Text> : null}
          </View>
          <Pressable onPress={() => router.push('/edit-profile')} className="rounded-xl bg-brand/10 px-3.5 py-2">
            <Text className="font-heading text-[11px] text-brand">Modifier</Text>
          </Pressable>
        </View>

        <SettingsGroup title="Compte">
          <SettingsRow
            icon={<User size={16} color={colors.brand.DEFAULT} />}
            label="Infos personnelles"
            onPress={() => router.push('/settings/account')}
          />
          <SettingsRow
            icon={<Lock size={16} color={colors.brand.DEFAULT} />}
            label="Sécurité"
            onPress={() => router.push('/settings/security')}
          />
          <SettingsRow
            icon={<Bell size={16} color={colors.brand.DEFAULT} />}
            label="Notifications"
            onPress={() => router.push('/settings/notifications')}
            isLast
          />
        </SettingsGroup>

        <SettingsGroup title="Confidentialité">
          <SettingsRow
            icon={<Eye size={16} color={colors.brand.DEFAULT} />}
            label="Visibilité"
            onPress={() => router.push('/settings/privacy')}
          />
          <SettingsRow
            icon={<Ban size={16} color={colors.brand.DEFAULT} />}
            label="Blocages"
            onPress={() => router.push('/blocked-users')}
            isLast
          />
        </SettingsGroup>

        <View className="mt-2 gap-2.5">
          <GhostButton label="Se déconnecter" tone="onLight" onPress={() => router.push('/settings/logout')} />
          <Pressable
            onPress={() => router.push('/settings/delete-account')}
            className="w-full rounded-2xl border-[1.5px] border-danger/[0.18] bg-danger/[0.07] py-4"
          >
            <Text className="text-center font-heading text-[13px] tracking-wide text-danger/[0.65]">
              Supprimer le compte
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="mb-2 font-heading text-[11px] text-ink/35">{title}</Text>
      <View className="overflow-hidden rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45]">{children}</View>
    </View>
  );
}
