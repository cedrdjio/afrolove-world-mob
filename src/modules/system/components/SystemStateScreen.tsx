import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { gradients } from '@/shared/constants/theme';
import type { LucideIcon } from 'lucide-react-native';

interface SystemStateScreenProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColors?: readonly [string, string];
}

export function SystemStateScreen({ Icon, title, description, actionLabel, onAction, iconColors }: SystemStateScreenProps) {
  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={230} color="rgba(106,79,192,0.09)" top={-50} right={-50} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-8">
        <LinearGradient
          colors={iconColors ?? gradients.brand}
          style={{
            width: 92,
            height: 92,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 26,
            shadowColor: '#6A4FC0',
            shadowOpacity: 0.28,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
          }}
        >
          <Icon size={40} color="#fff" strokeWidth={1.6} />
        </LinearGradient>

        <Text className="mb-2.5 text-center font-display text-[26px] uppercase leading-none text-ink">{title}</Text>
        <Text className="mb-8 text-center font-body text-[13px] leading-[20px] text-ink-muted">{description}</Text>

        {actionLabel ? <GradientButton label={actionLabel} onPress={onAction} style={{ width: '100%' }} /> : null}
      </View>
    </View>
  );
}
