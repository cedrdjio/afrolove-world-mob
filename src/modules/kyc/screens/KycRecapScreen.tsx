import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Check, ShieldCheck, Send } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useAppError } from '@/shared/hooks/useAppError';
import { KycHeader } from '@/modules/kyc/components/KycHeader';
import { useKycStore, type KycDocType } from '@/modules/kyc/stores/kycStore';
import { useSubmitKyc } from '@/modules/kyc/hooks/useKyc';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { colors } from '@/shared/constants/theme';

const DOC_LABELS: Record<KycDocType, string> = {
  cni: 'CNI',
  passport: 'Passeport',
  license: 'Permis de conduire',
};

export function KycRecapScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { docType, frontUri, backUri, selfieUri, reset } = useKycStore();
  const submitKyc = useSubmitKyc();
  const submitError = useAppError(submitKyc.error);
  const [progress, setProgress] = useState(0);

  const documentsReady = Boolean(frontUri && selfieUri && user);

  const handleSubmit = () => {
    if (!frontUri || !selfieUri || !user) return;
    submitKyc.mutate(
      {
        input: { profileId: user.id, docType, frontUri, backUri, selfieUri },
        onProgress: setProgress,
      },
      {
        onSuccess: () => {
          reset();
          router.replace('/kyc/pending');
        },
      },
    );
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={210} color="rgba(201,134,42,0.08)" bottom={-40} left={-40} duration={10000} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 60, paddingBottom: 26 }}>
        <KycHeader step={3} />

        <Animated.View entering={FadeInDown.springify().damping(16)} className="mb-[22px] items-center">
          <View className="mb-3.5 h-[68px] w-[68px] items-center justify-center rounded-[22px] border-[1.5px] border-success/25 bg-success/[0.1]">
            <Check size={32} color={colors.success} strokeWidth={1.8} />
          </View>
          <Text className="mb-1.5 text-center font-display text-[28px] uppercase leading-none text-ink">
            Dossier complet !{'\n'}
            <Text className="text-brand">Vérifiez avant envoi</Text>
          </Text>
          <Text className="text-center font-body text-[12px] leading-[18px] text-ink-muted">
            Notre équipe valide votre dossier manuellement sous 48h.
          </Text>
        </Animated.View>

        {submitError ? (
          <View className="mb-4">
            <ErrorState error={submitError} variant="inline" onRetry={handleSubmit} />
          </View>
        ) : null}

        <View className="mb-[18px] gap-2.5">
          <Animated.View
            entering={FadeInDown.delay(90).springify().damping(16)}
            className="flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5"
          >
            <View className="h-9 w-[52px] flex-row overflow-hidden rounded-lg border border-brand/20">
              {frontUri ? <Image source={{ uri: frontUri }} style={{ flex: 1 }} contentFit="cover" /> : null}
              {backUri ? <Image source={{ uri: backUri }} style={{ flex: 1 }} contentFit="cover" /> : null}
            </View>
            <View className="flex-1">
              <Text className="mb-0.5 font-heading text-[13px] uppercase text-ink">
                {DOC_LABELS[docType]} {backUri ? 'Recto + Verso' : 'Recto'}
              </Text>
              <Text className="font-body text-[11px] text-ink-muted">
                {backUri ? '2 photos' : '1 photo'} · Prêt à envoyer
              </Text>
            </View>
            <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-success/[0.12]">
              <Check size={12} color={colors.success} strokeWidth={2.8} />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(160).springify().damping(16)}
            className="flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5"
          >
            <View className="h-9 w-[52px] overflow-hidden rounded-lg">
              {selfieUri ? <Image source={{ uri: selfieUri }} style={{ flex: 1 }} contentFit="cover" /> : null}
            </View>
            <View className="flex-1">
              <Text className="mb-0.5 font-heading text-[13px] uppercase text-ink">Selfie + Document</Text>
              <Text className="font-body text-[11px] text-ink-muted">Visage + pièce visibles</Text>
            </View>
            <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-success/[0.12]">
              <Check size={12} color={colors.success} strokeWidth={2.8} />
            </View>
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeInDown.delay(230).springify().damping(16)}
          className="mb-4 flex-row items-center gap-2.5 rounded-2xl border border-success/[0.18] bg-success/[0.08] px-3.5 py-3"
        >
          <ShieldCheck size={14} color={colors.success} />
          <Text className="flex-1 font-body text-[11.5px] leading-[16px] text-success">
            Documents chiffrés · Stockage privé · Supprimés après vérification · Conforme RGPD
          </Text>
        </Animated.View>

        <GradientButton
          label={submitKyc.isPending ? `Envoi en cours… ${progress}%` : 'Soumettre mon dossier KYC'}
          icon={<Send size={15} color="#fff" />}
          iconPosition="left"
          loading={submitKyc.isPending}
          disabled={!documentsReady}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
}
