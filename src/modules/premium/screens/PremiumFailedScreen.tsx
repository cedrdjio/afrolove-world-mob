import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';

export function PremiumFailedScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={260} color="rgba(194,69,69,0.18)" bottom={140} right={-40} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-7 h-24 w-24 items-center justify-center rounded-full border-[1.5px] border-danger/[0.3] bg-danger/[0.12]">
          <X size={40} color="#C24545" strokeWidth={1.8} />
        </View>

        <Text className="mb-3 text-center font-display-black text-[28px] uppercase text-white">
          Paiement échoué
        </Text>
        <Text className="mb-10 text-center font-body text-[13.5px] leading-[21px] text-white/50">
          Le paiement n'a pas pu être traité. Vérifiez vos informations et réessayez.
        </Text>

        <GradientButton label="Réessayer" onPress={() => router.back()} style={{ width: '100%', marginBottom: 12 }} />
        <Pressable onPress={() => router.replace('/(tabs)/discover')}>
          <Text className="font-body-medium text-[13px] text-white/40">Plus tard</Text>
        </Pressable>
      </View>
    </View>
  );
}
