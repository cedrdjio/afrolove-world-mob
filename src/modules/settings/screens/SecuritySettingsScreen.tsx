import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, KeyRound, Smartphone, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { SettingsRow } from '@/shared/components/ui/SettingsRow';
import { colors } from '@/shared/constants/theme';

export function SecuritySettingsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={220} color="rgba(106,79,192,0.09)" top={-50} right={-50} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 68, paddingBottom: 28 }}>
        <View className="mb-6 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
          </IconButton>
          <Text className="font-display text-[20px] uppercase text-ink">Sécurité</Text>
          <View style={{ width: 44 }} />
        </View>

        <View className="overflow-hidden rounded-2xl border-[1.5px] border-white/90 bg-white/70">
          <SettingsRow
            icon={<Mail size={16} color={colors.brand.DEFAULT} />}
            label="Changer l'email"
            onPress={() => router.push('/settings/change-email')}
          />
          <SettingsRow
            icon={<KeyRound size={16} color={colors.brand.DEFAULT} />}
            label="Changer le mot de passe"
            onPress={() => router.push('/settings/change-password')}
          />
          <SettingsRow
            icon={<Smartphone size={16} color={colors.brand.DEFAULT} />}
            label="Appareils connectés"
            onPress={() => {}}
          />
          <SettingsRow
            icon={<ShieldCheck size={16} color={colors.brand.DEFAULT} />}
            label="Authentification à deux facteurs"
            onPress={() => {}}
            isLast
          />
        </View>
      </View>
    </View>
  );
}
