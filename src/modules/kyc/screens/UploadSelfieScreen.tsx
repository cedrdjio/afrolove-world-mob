import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowLeft, Check, RotateCcw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useKycStore } from '@/modules/kyc/stores/kycStore';
import { colors } from '@/shared/constants/theme';

export function UploadSelfieScreen() {
  const router = useRouter();
  const { selfieUri, setSelfieUri } = useKycStore();
  const scanY = useSharedValue(0);

  const captureSelfie = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      cameraType: ImagePicker.CameraType.front,
    });
    if (!result.canceled && result.assets[0]) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSelfieUri(result.assets[0].uri);
    }
  };

  useEffect(() => {
    scanY.value = withRepeat(withSequence(withTiming(1, { duration: 2000 }), withTiming(0, { duration: 0 })), -1, false);
  }, [scanY]);

  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanY.value * 180 - 90 }],
    opacity: scanY.value > 0.05 && scanY.value < 0.95 ? 1 : 0,
  }));

  return (
    <View className="flex-1 bg-deep">
      <View className="relative flex-1 items-center justify-center overflow-hidden bg-deep">
        <View
          className="items-center justify-center overflow-hidden rounded-full border-[2.5px] border-brand/70"
          style={{ width: 220, height: 290 }}
        >
          {selfieUri ? (
            <Animated.View entering={FadeIn.duration(280)} style={{ position: 'absolute', inset: 0 }}>
              <Image source={{ uri: selfieUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            </Animated.View>
          ) : (
            <Animated.View
              style={[
                { position: 'absolute', width: 180, height: 2, backgroundColor: 'rgba(106,79,192,0.8)' },
                scanStyle,
              ]}
            />
          )}
        </View>

        {/* Corner markers */}
        <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -132 }, { translateY: -167 }], width: 22, height: 22, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderColor: colors.brand.light, borderTopLeftRadius: 3 }} />
        <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: 110 }, { translateY: -167 }], width: 22, height: 22, borderTopWidth: 2.5, borderRightWidth: 2.5, borderColor: colors.brand.light, borderTopRightRadius: 3 }} />
        <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -132 }, { translateY: 145 }], width: 22, height: 22, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderColor: colors.brand.light, borderBottomLeftRadius: 3 }} />
        <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: 110 }, { translateY: 145 }], width: 22, height: 22, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderColor: colors.brand.light, borderBottomRightRadius: 3 }} />

        <View className="absolute bottom-5 rounded-full border border-white/20 bg-white/[0.12] px-5 py-2.5">
          <Text className="font-heading-semibold text-[12.5px] text-white">Tenez votre CNI sous votre visage</Text>
        </View>
      </View>

      <View className="absolute inset-x-[18px] flex-row items-center justify-between" style={{ top: 60 }}>
        <Pressable onPress={() => router.back()}>
          <View className="h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/[0.14]">
            <ArrowLeft size={17} color="#fff" strokeWidth={2} />
          </View>
        </Pressable>
        <View className="rounded-full border border-white/20 bg-white/[0.12] px-4 py-1.5">
          <Text className="font-heading text-[10px] uppercase text-white/70">Étape 2/3</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View className="items-center gap-4 px-6" style={{ paddingBottom: 44, paddingTop: 20 }}>
        <Text className="text-center font-body text-[12.5px] leading-[19px] text-white/45">
          Votre visage <Text className="text-white/75">+ votre pièce d'identité</Text>
          {'\n'}doivent être visibles simultanément.
        </Text>
        {selfieUri ? (
          <View className="flex-row items-center gap-5">
            <Pressable
              onPress={captureSelfie}
              className="h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/[0.12] active:opacity-70"
              accessibilityLabel="Reprendre la photo"
            >
              <RotateCcw size={18} color="rgba(255,255,255,0.8)" strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/kyc/recap')}
              className="h-[72px] w-[72px] items-center justify-center rounded-full bg-brand active:opacity-85"
              accessibilityLabel="Valider cette photo"
            >
              <Check size={30} color="#fff" strokeWidth={2.6} />
            </Pressable>
            <View style={{ width: 48 }} />
          </View>
        ) : (
          <Pressable
            onPress={captureSelfie}
            className="h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-white/30 active:opacity-80"
            accessibilityLabel="Prendre le selfie"
          >
            <View className="h-[58px] w-[58px] rounded-full bg-white/90" />
          </Pressable>
        )}
      </View>
    </View>
  );
}
