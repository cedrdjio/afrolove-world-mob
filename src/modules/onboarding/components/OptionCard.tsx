import { Pressable, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { gradients } from '@/shared/constants/theme';

interface OptionCardProps {
  emoji: string;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionCard({ emoji, title, description, selected, onPress }: OptionCardProps) {
  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    onPress();
  };

  if (selected) {
    return (
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-row items-center gap-3.5 rounded-[22px] px-5 py-5"
          style={{ shadowColor: '#C86040', shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 10 } }}
        >
          <View className="h-[50px] w-[50px] items-center justify-center rounded-2xl bg-white/20">
            <Text style={{ fontSize: 24 }}>{emoji}</Text>
          </View>
          <View className="flex-1">
            <Text className="mb-1 font-heading text-[16px] uppercase text-white">{title}</Text>
            <Text className="font-body text-[12px] text-white/70">{description}</Text>
          </View>
          <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-white">
            <View className="h-3 w-3 rounded-full bg-brand" />
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center gap-3.5 rounded-[22px] border-[1.5px] border-white/[0.88] bg-white/65 px-5 py-5"
      style={{ shadowColor: '#2C1408', shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 4 } }}
    >
      <View className="h-[50px] w-[50px] items-center justify-center rounded-2xl bg-brand/[0.08]">
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
      </View>
      <View className="flex-1">
        <Text className="mb-1 font-heading text-[16px] uppercase text-ink">{title}</Text>
        <Text className="font-body text-[12px] text-ink-muted">{description}</Text>
      </View>
      <View className="h-[26px] w-[26px] rounded-full border-2 border-ink/[0.14]" />
    </Pressable>
  );
}
