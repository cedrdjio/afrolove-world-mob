import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withDelay } from 'react-native-reanimated';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { colors } from '@/shared/constants/theme';

export function ReportConfirmationScreen() {
  const router = useRouter();
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(150, withSpring(1, { damping: 9, stiffness: 120 }));
  }, [scale]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={220} color="rgba(76,175,80,0.1)" top={-40} left={-40} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-8">
        <Animated.View
          style={iconStyle}
          className="mb-6 h-20 w-20 items-center justify-center rounded-full border-[1.5px] border-success/25 bg-success/[0.1]"
        >
          <ShieldCheck size={34} color={colors.success} strokeWidth={1.8} />
        </Animated.View>

        <Text className="mb-2.5 text-center font-display text-[26px] uppercase leading-none text-ink">
          Signalement envoyé
        </Text>
        <Text className="mb-9 text-center font-body text-[13px] leading-[20px] text-ink-muted">
          Merci de nous aider à garder AfroLove World sûr. Notre équipe va examiner ce signalement rapidement.
        </Text>

        <GradientButton label="Retour" onPress={() => router.replace('/(tabs)/discover')} style={{ width: '100%' }} />
      </View>
    </View>
  );
}
