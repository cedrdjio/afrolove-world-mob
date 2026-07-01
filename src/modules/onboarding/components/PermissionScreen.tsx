import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingLayout } from '@/modules/onboarding/components/OnboardingLayout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { GhostButton } from '@/shared/components/ui/GhostButton';
import { gradients } from '@/shared/constants/theme';
import type { LucideIcon } from 'lucide-react-native';

interface PermissionScreenProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  onSkip: () => void;
}

export function PermissionScreen({ Icon, title, description, primaryLabel, onPrimaryPress, onSkip }: PermissionScreenProps) {
  return (
    <OnboardingLayout orbPosition="topRight">
      <View className="flex-1 items-center justify-center px-2">
        <LinearGradient
          colors={gradients.brand}
          style={{
            width: 100,
            height: 100,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
            shadowColor: '#C86040',
            shadowOpacity: 0.3,
            shadowRadius: 26,
            shadowOffset: { width: 0, height: 12 },
          }}
        >
          <Icon size={44} color="#fff" strokeWidth={1.6} />
        </LinearGradient>
        <Text className="mb-3 text-center font-display text-[30px] uppercase leading-[1.05] text-ink">
          {title}
        </Text>
        <Text className="text-center font-body text-[13.5px] leading-[21px] text-ink-muted">{description}</Text>
      </View>

      <GradientButton label={primaryLabel} onPress={onPrimaryPress} style={{ marginBottom: 12 }} />
      <GhostButton label="Plus tard" tone="onLight" onPress={onSkip} />
    </OnboardingLayout>
  );
}
