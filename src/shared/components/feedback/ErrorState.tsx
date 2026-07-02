import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { WifiOff, ServerCrash, Lock, MailWarning, ShieldAlert, KeyRound, Clock, AlertTriangle } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { colors } from '@/shared/constants/theme';
import { cn } from '@/shared/utils/cn';
import type { AppError, AppErrorKind } from '@/shared/utils/errorMapping';

const ICONS: Record<AppErrorKind, LucideIcon> = {
  no_internet: WifiOff,
  server_error: ServerCrash,
  invalid_credentials: Lock,
  email_exists: MailWarning,
  weak_password: ShieldAlert,
  invalid_email: MailWarning,
  invalid_otp: KeyRound,
  session_expired: Clock,
  timeout: Clock,
  unknown: AlertTriangle,
};

const DANGER_GRADIENT = ['#B41E14', '#6B0E0A'] as const;

interface ErrorStateProps {
  error: AppError;
  onRetry?: () => void;
  variant?: 'fullscreen' | 'inline';
  /** Inline variant only — matches the screen's own background so the
   *  danger tint stays legible on both cream and deep themes. */
  tone?: 'onLight' | 'onDark';
}

/** One component, every error kind: swaps icon/title/message from the
 *  mapped AppError so Login, Register, uploads, etc. never hand-roll
 *  their own error UI. */
export function ErrorState({ error, onRetry, variant = 'fullscreen', tone = 'onLight' }: ErrorStateProps) {
  const Icon = ICONS[error.kind];
  const shakeX = useSharedValue(0);
  const scale = useSharedValue(variant === 'fullscreen' ? 0 : 1);

  useEffect(() => {
    if (variant === 'inline') {
      shakeX.value = withSequence(
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(-4, { duration: 60 }),
        withTiming(4, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
    } else {
      scale.value = withSpring(1, { damping: 9, stiffness: 140 });
    }
    // Re-trigger the attention animation every time a new error comes in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error.kind, error.message]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (variant === 'inline') {
    const onDark = tone === 'onDark';
    return (
      <Animated.View
        style={shakeStyle}
        className={cn(
          'flex-row items-start gap-3 rounded-2xl border p-4',
          onDark ? 'border-white/[0.14] bg-white/[0.08]' : 'border-danger/20 bg-danger/[0.06]',
        )}
      >
        <View className={cn('h-9 w-9 items-center justify-center rounded-full', onDark ? 'bg-white/10' : 'bg-danger/10')}>
          <Icon size={16} color={onDark ? '#FF6B5E' : colors.danger} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text className={cn('mb-0.5 font-heading-semibold text-[12.5px]', onDark ? 'text-white' : 'text-ink')}>
            {error.title}
          </Text>
          <Text className={cn('font-body text-[12px] leading-[17px]', onDark ? 'text-white/60' : 'text-ink-muted')}>
            {error.message}
          </Text>
          {error.retryable && onRetry ? (
            <Text onPress={onRetry} className="mt-2 font-heading-semibold text-[12px] text-brand">
              Réessayer
            </Text>
          ) : null}
        </View>
      </Animated.View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Animated.View style={iconStyle}>
        <LinearGradient
          colors={DANGER_GRADIENT}
          style={{
            width: 92,
            height: 92,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 26,
            shadowColor: '#6B0E0A',
            shadowOpacity: 0.28,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
          }}
        >
          <Icon size={40} color="#fff" strokeWidth={1.6} />
        </LinearGradient>
      </Animated.View>

      <Text className="mb-2.5 text-center font-display text-[26px] uppercase leading-none text-ink">
        {error.title}
      </Text>
      <Text className="mb-8 text-center font-body text-[13px] leading-[20px] text-ink-muted">{error.message}</Text>

      {error.retryable && onRetry ? (
        <GradientButton label="Réessayer" onPress={onRetry} style={{ width: '100%' }} />
      ) : null}
    </View>
  );
}
