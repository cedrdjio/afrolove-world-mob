import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/shared/constants/theme';

interface ProgressStepsProps {
  total: number;
  current: number; // 1-indexed, segments <= current are filled
}

export function ProgressSteps({ total, current }: ProgressStepsProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) =>
        i < current ? (
          <LinearGradient
            key={i}
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: 28, height: 4, borderRadius: 2 }}
          />
        ) : (
          <View key={i} className="h-1 w-7 rounded-full bg-ink/[0.09]" />
        ),
      )}
    </View>
  );
}
