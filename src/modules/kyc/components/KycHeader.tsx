import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { IconButton } from '@/shared/components/ui/IconButton';
import { colors, gradients } from '@/shared/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandLogo } from '@/shared/components/ui/BrandLogo';

export function KycHeader({ step, total = 3 }: { step: number; total?: number }) {
  const router = useRouter();

  return (
    <View className="mb-5 flex-row items-center justify-between">
      <IconButton onPress={() => router.back()}>
        <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
      </IconButton>
      <View className="mx-3.5 flex-1">
        <View className="mb-1.5 flex-row justify-between">
          <Text className="font-heading text-[10px] text-ink">KYC</Text>
          <Text className="font-heading-semibold text-[10px] text-brand">
            Étape {step}/{total}
          </Text>
        </View>
        <View className="h-[5px] overflow-hidden rounded-full bg-ink/[0.08]">
          <LinearGradient
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: '100%', width: `${(step / total) * 100}%`, borderRadius: 3 }}
          />
        </View>
      </View>
      <BrandLogo size={44} />
    </View>
  );
}
