import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withDelay } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { gradients } from '@/shared/constants/theme';

export function AuthSuccessScreen() {
  const router = useRouter();
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(150, withSpring(1, { damping: 9, stiffness: 120 }));
  }, [scale]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={280} color="rgba(76,175,80,0.16)" top={120} left={-40} duration={9000} />
        <GlowOrb size={220} color="rgba(200,96,64,0.18)" bottom={160} right={-30} duration={11000} delay={1200} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-8">
        <Animated.View style={iconStyle} className="mb-7">
          <LinearGradient
            colors={gradients.brand}
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#C86040',
              shadowOpacity: 0.45,
              shadowRadius: 30,
              shadowOffset: { width: 0, height: 14 },
            }}
          >
            <Check size={44} color="#fff" strokeWidth={2.6} />
          </LinearGradient>
        </Animated.View>

        <Text className="mb-3 text-center font-display-black text-[32px] uppercase text-white">
          Compte vérifié !
        </Text>
        <Text className="mb-10 text-center font-body text-[13.5px] leading-[21px] text-white/50">
          Bienvenue dans la communauté AfroLove World.{'\n'}Configurons votre profil.
        </Text>

        <GradientButton
          label="Continuer"
          onPress={() => router.replace('/(onboarding)/carousel')}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}
