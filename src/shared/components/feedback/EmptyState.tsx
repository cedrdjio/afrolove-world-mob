import { View, Text } from 'react-native';
import { GradientButton } from '@/shared/components/ui/GradientButton';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-brand/10">{icon}</View>
      <Text className="mb-2 text-center font-display text-[26px] uppercase text-ink">{title}</Text>
      {description ? (
        <Text className="mb-8 text-center font-body text-[13px] leading-5 text-ink-muted">{description}</Text>
      ) : null}
      {actionLabel ? (
        <GradientButton label={actionLabel} onPress={onAction} style={{ width: '100%' }} />
      ) : null}
    </View>
  );
}
