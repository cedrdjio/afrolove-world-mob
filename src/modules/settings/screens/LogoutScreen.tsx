import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { colors } from '@/shared/constants/theme';

export function LogoutScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={220} color="rgba(200,96,64,0.09)" top={-50} left={-50} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-brand/[0.1]">
          <LogOut size={28} color={colors.brand.DEFAULT} strokeWidth={1.7} />
        </View>
        <Text className="mb-2.5 text-center font-display text-[26px] uppercase leading-none text-ink">
          Se déconnecter ?
        </Text>
        <Text className="mb-9 text-center font-body text-[13px] leading-[20px] text-ink-muted">
          Vous devrez vous reconnecter pour accéder à votre compte AfroLove World.
        </Text>

        <GradientButton
          label="Se déconnecter"
          onPress={() => router.replace('/(auth)/welcome')}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <Pressable onPress={() => router.back()}>
          <Text className="font-body-medium text-[13px] text-ink-muted">Annuler</Text>
        </Pressable>
      </View>
    </View>
  );
}
