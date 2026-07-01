import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { gradients } from '@/shared/constants/theme';

export function PremiumLockedScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={280} color="rgba(201,134,42,0.2)" top={100} left={-50} duration={9000} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-8">
        <Pressable onPress={() => router.back()} className="absolute right-6 top-16">
          <View className="h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/[0.12]">
            <X size={16} color="rgba(255,255,255,0.55)" />
          </View>
        </Pressable>

        <LinearGradient
          colors={gradients.gold}
          style={{
            width: 88,
            height: 88,
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 26,
            shadowColor: '#C9862A',
            shadowOpacity: 0.4,
            shadowRadius: 26,
            shadowOffset: { width: 0, height: 12 },
          }}
        >
          <Lock size={38} color="#fff" strokeWidth={1.8} />
        </LinearGradient>

        <Text className="mb-3 text-center font-display-black text-[28px] uppercase text-white">
          Fonctionnalité{'\n'}Premium
        </Text>
        <Text className="mb-10 text-center font-body text-[13.5px] leading-[21px] text-white/50">
          Découvrez qui vous a déjà aimé(e) et bien plus encore avec AfroLove World Premium.
        </Text>

        <GradientButton label="Débloquer Premium" onPress={() => router.replace('/premium')} style={{ width: '100%', marginBottom: 12 }} />
        <Pressable onPress={() => router.back()}>
          <Text className="font-body-medium text-[13px] text-white/40">Pas maintenant</Text>
        </Pressable>
      </View>
    </View>
  );
}
