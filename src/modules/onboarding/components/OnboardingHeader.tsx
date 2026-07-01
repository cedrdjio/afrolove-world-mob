import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { IconButton } from '@/shared/components/ui/IconButton';
import { ProgressSteps } from '@/shared/components/ui/ProgressSteps';
import { colors } from '@/shared/constants/theme';

interface OnboardingHeaderProps {
  step: number;
  total?: number;
  onBack?: () => void;
}

export function OnboardingHeader({ step, total = 7, onBack }: OnboardingHeaderProps) {
  const router = useRouter();

  return (
    <View className="mb-7 flex-row items-center justify-between">
      <IconButton onPress={onBack ?? (() => router.back())}>
        <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
      </IconButton>
      <ProgressSteps total={total} current={step} />
      <Text className="font-heading text-[11px] text-ink/30">
        {step}/{total}
      </Text>
    </View>
  );
}
