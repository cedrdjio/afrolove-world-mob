import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeCheck } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withDelay } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { gradients } from '@/shared/constants/theme';

export function KycApprovedScreen() {
  const router = useRouter();
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(150, withSpring(1, { damping: 8, stiffness: 120 }));
  }, [scale]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={280} color="rgba(62,155,95,0.16)" top={110} left={-40} duration={9000} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-8">
        <Animated.View style={iconStyle} className="mb-7">
          <LinearGradient
            colors={gradients.gold}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#9B7EDE',
              shadowOpacity: 0.42,
              shadowRadius: 30,
              shadowOffset: { width: 0, height: 14 },
            }}
          >
            <BadgeCheck size={46} color="#fff" strokeWidth={1.8} />
          </LinearGradient>
        </Animated.View>

        <Text className="mb-3 text-center font-display-black text-[30px] uppercase text-white">
          Profil vérifié !
        </Text>
        <Text className="mb-10 text-center font-body text-[13.5px] leading-[21px] text-white/50">
          Félicitations ! Votre badge vérifié est maintenant visible sur votre profil, augmentant votre
          crédibilité auprès des autres membres.
        </Text>

        <GradientButton
          label="Voir mon profil"
          onPress={() => router.replace('/(tabs)/profile')}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}
