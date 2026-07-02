import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Check } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { useKycSubmission } from '@/modules/kyc/hooks/useKyc';
import { colors } from '@/shared/constants/theme';

export function KycPendingScreen() {
  const router = useRouter();
  const submission = useKycSubmission();
  const float = useSharedValue(0);
  const pulse = useSharedValue(0.4);

  const checkStatus = async () => {
    const { data } = await submission.refetch();
    if (data?.status === 'approved') router.replace('/kyc/approved');
    else if (data?.status === 'rejected') router.replace('/kyc/rejected');
    // Still pending: stay here, the copy already says "sous 48h".
  };

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    pulse.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.4, { duration: 700 })), -1, false);
  }, [float, pulse]);

  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={300} color="rgba(201,134,42,0.14)" top={110} left={45} duration={8000} />
        <GlowOrb size={180} color="rgba(200,96,64,0.1)" bottom={100} right={20} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-7" style={{ paddingBottom: 20 }}>
        <Animated.View
          style={[floatStyle]}
          className="mb-8 h-[110px] w-[110px] items-center justify-center rounded-[32px] border border-white/[0.14] bg-white/[0.08]"
        >
          <ShieldCheck size={52} color="rgba(201,134,42,0.9)" strokeWidth={1.4} />
        </Animated.View>

        <Text className="mb-2 text-center font-display-black text-[34px] uppercase tracking-wide text-white">
          Dossier soumis !
        </Text>
        <Text className="mb-3.5 text-center font-display-semibold text-[17px] uppercase tracking-[2px] text-white/45">
          Vérification en cours
        </Text>
        <Text className="mb-9 text-center font-body text-[13px] leading-[20px] text-white/[0.38]">
          Notre équipe examine votre dossier.{'\n'}Vous recevrez une notification sous{' '}
          <Text className="text-white/65">48 heures maximum.</Text>
        </Text>

        <View className="mb-6 w-full gap-3.5 rounded-3xl border border-white/[0.16] bg-white/[0.1] p-5">
          <View className="flex-row items-center gap-3">
            <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-success/20">
              <Check size={14} color={colors.success} strokeWidth={2.8} />
            </View>
            <View className="flex-1">
              <Text className="font-heading-semibold text-[12.5px] uppercase text-white/85">Documents reçus</Text>
              <Text className="mt-0.5 font-body text-[10.5px] text-white/40">CNI recto/verso + selfie</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-gold/20">
              <Animated.View style={[pulseStyle, { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold.DEFAULT }]} />
            </View>
            <View className="flex-1">
              <Text className="font-heading-semibold text-[12.5px] uppercase text-white/85">Analyse en cours</Text>
              <Text className="mt-0.5 font-body text-[10.5px] text-gold">Équipe de vérification</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3 opacity-40">
            <View className="h-8 w-8 items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-white/20 bg-white/10">
              <Check size={14} color="rgba(255,255,255,0.5)" strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="font-heading-semibold text-[12.5px] uppercase text-white/50">Badge vérifié accordé</Text>
              <Text className="mt-0.5 font-body text-[10.5px] text-white/30">En attente de validation</Text>
            </View>
          </View>
        </View>

        <GradientButton
          label="Continuer à explorer"
          onPress={() => router.replace('/(tabs)/discover')}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <Pressable onPress={checkStatus} disabled={submission.isRefetching}>
          <Text className="font-body-medium text-[13px] text-white/60">
            {submission.isRefetching ? 'Vérification…' : 'Voir le statut de mon dossier'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
