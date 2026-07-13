import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withDelay } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { gradients } from '@/shared/constants/theme';

export function PremiumSuccessScreen() {
  const router = useRouter();
  const { plan } = useLocalSearchParams<{ plan?: string }>();
  const scale = useSharedValue(0);

  // L'écran vit dans la pile modale premium : on referme d'abord la modale,
  // puis on remplace vers les tabs — un replace direct inter-piles depuis la
  // modale pouvait faire échouer la navigation.
  const goToApp = () => {
    try {
      router.dismissAll();
    } catch {
      // pas de modale à fermer — on continue
    }
    router.replace('/(tabs)/discover');
  };

  useEffect(() => {
    scale.value = withDelay(150, withTiming(1, { duration: 380 }));
  }, [scale]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={280} color="rgba(155,126,222,0.2)" top={110} left={-40} duration={9000} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-8">
        <Animated.View style={iconStyle} className="mb-7">
          <LinearGradient
            colors={gradients.gold}
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#9B7EDE',
              shadowOpacity: 0.45,
              shadowRadius: 30,
              shadowOffset: { width: 0, height: 14 },
            }}
          >
            <Check size={44} color="#fff" strokeWidth={2.6} />
          </LinearGradient>
        </Animated.View>

        <Text className="mb-3 text-center font-display-black text-[30px] text-white">
          Bienvenue dans{'\n'}Premium !
        </Text>
        <Text className="mb-10 text-center font-body text-[13.5px] leading-[21px] text-white/50">
          {plan ? `Votre forfait "${plan}" est activé. ` : ''}Profitez de tous les avantages dès maintenant.
        </Text>

        <GradientButton label="Découvrir l'application" onPress={goToApp} style={{ width: '100%' }} />
      </View>
    </View>
  );
}
