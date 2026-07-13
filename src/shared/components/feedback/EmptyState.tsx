import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { GradientButton } from '@/shared/components/ui/GradientButton';

interface EmptyStateProps {
  /** Optional — when omitted, the floating-heart Lottie plays instead. */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    // minHeight keeps the illustration, texts and CTA visually grouped even
    // when the parent (e.g. a ScrollView slot) gives flex-1 no height basis —
    // without it the content collapses and elements overlap the header above.
    <View className="flex-1 items-center justify-center px-8" style={{ minHeight: 300 }}>
      {icon ? (
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-brand/10">{icon}</View>
      ) : (
        <LottieView
          source={require('@/assets/lottie/empty-hearts.json')}
          autoPlay
          loop
          style={{ width: 120, height: 120, marginBottom: 14 }}
        />
      )}
      <Text className="mb-2 text-center font-display text-[26px] text-ink">{title}</Text>
      {description ? (
        <Text className="mb-8 text-center font-body text-[13px] leading-5 text-ink-muted">{description}</Text>
      ) : null}
      {actionLabel ? (
        <GradientButton label={actionLabel} onPress={onAction} style={{ width: '100%' }} />
      ) : null}
    </View>
  );
}
