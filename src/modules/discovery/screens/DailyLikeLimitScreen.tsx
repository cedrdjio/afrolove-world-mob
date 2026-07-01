import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { gradients } from '@/shared/constants/theme';

export function DailyLikeLimitScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={260} color="rgba(200,96,64,0.2)" bottom={140} right={-40} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-8">
        <Pressable onPress={() => router.back()} className="absolute right-6 top-16">
          <View className="h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/[0.12]">
            <X size={16} color="rgba(255,255,255,0.55)" />
          </View>
        </Pressable>

        <LinearGradient
          colors={gradients.brand}
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 26,
            shadowColor: '#C86040',
            shadowOpacity: 0.4,
            shadowRadius: 26,
            shadowOffset: { width: 0, height: 12 },
          }}
        >
          <Clock size={38} color="#fff" strokeWidth={1.8} />
        </LinearGradient>

        <Text className="mb-3 text-center font-display-black text-[28px] uppercase text-white">
          Limite quotidienne{'\n'}atteinte
        </Text>
        <Text className="mb-2 text-center font-body text-[13.5px] leading-[21px] text-white/50">
          Vous avez utilisé tous vos likes gratuits pour aujourd'hui.
        </Text>
        <Text className="mb-10 font-heading-semibold text-[12px] uppercase tracking-widest text-gold">
          Réinitialisation dans 6h 24min
        </Text>

        <GradientButton label="Likes illimités avec Premium" onPress={() => router.replace('/premium')} style={{ width: '100%', marginBottom: 12 }} />
        <Pressable onPress={() => router.back()}>
          <Text className="font-body-medium text-[13px] text-white/40">Continuer à explorer</Text>
        </Pressable>
      </View>
    </View>
  );
}
