import { Pressable, View, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/shared/constants/theme';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  isLast?: boolean;
  right?: React.ReactNode;
}

export function SettingsRow({ icon, label, onPress, isLast = false, right }: SettingsRowProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      className={`flex-row items-center justify-between px-[18px] py-3.5 ${
        isLast ? '' : 'border-b border-white/60'
      }`}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-[34px] w-[34px] items-center justify-center rounded-md bg-brand/10">{icon}</View>
        <Text className="font-heading-semibold text-[14px] uppercase text-ink">{label}</Text>
      </View>
      {right ?? <ChevronRight size={17} color="rgba(46,36,64,0.22)" />}
    </Pressable>
  );
}
