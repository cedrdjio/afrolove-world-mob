import { View } from 'react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  orbPosition?: 'topRight' | 'topLeft' | 'bottomLeft' | 'bottomRight';
}

const ORB_POSITIONS = {
  topRight: { top: -60, right: -60 },
  topLeft: { top: -50, left: -50 },
  bottomLeft: { bottom: -50, left: -50 },
  bottomRight: { bottom: -40, right: -30 },
} as const;

export function OnboardingLayout({ children, orbPosition = 'topRight' }: OnboardingLayoutProps) {
  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={250} color="rgba(106,79,192,0.11)" duration={9000} {...ORB_POSITIONS[orbPosition]} />
      </ScreenBackground>
      <View className="flex-1 px-6" style={{ paddingTop: 68, paddingBottom: 28 }}>
        {children}
      </View>
    </View>
  );
}
