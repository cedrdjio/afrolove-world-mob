import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { IconButton } from '@/shared/components/ui/IconButton';
import { colors } from '@/shared/constants/theme';

interface ScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  variant?: 'light' | 'dark';
}

export function ScreenHeader({ title, onBack, right, variant = 'light' }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-1 pb-6">
      <IconButton variant={variant} onPress={onBack ?? (() => router.back())}>
        <ArrowLeft size={19} color={variant === 'light' ? colors.ink.DEFAULT : colors.white} strokeWidth={2} />
      </IconButton>
      {title ? (
        <Text
          className="font-display text-[20px] tracking-wide"
          style={{ color: variant === 'light' ? colors.ink.DEFAULT : colors.white }}
        >
          {title}
        </Text>
      ) : (
        <View />
      )}
      {right ?? <View style={{ width: 44 }} />}
    </View>
  );
}
