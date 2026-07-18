import { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ShieldCheck, BadgeCheck, Heart, X } from 'lucide-react-native';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { colors } from '@/shared/constants/theme';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useKycSubmission } from '@/modules/kyc/hooks/useKyc';

/** On re-propose la vérification tous les 4 jours, jamais plus. */
const PROMPT_INTERVAL_DAYS = 4;
const STORAGE_KEY = 'verification_prompt_last_seen';

/**
 * Rappel périodique de vérification d'identité. Monté une fois dans le layout
 * des tabs : si le membre n'est pas vérifié (et n'a pas de dossier KYC en
 * cours), une fenêtre l'invite à obtenir son badge « Vérifié » — les profils
 * vérifiés inspirent confiance et reçoivent plus de matches. La date de
 * dernier affichage est mémorisée sur l'appareil pour espacer les rappels.
 */
export function VerificationPromptModal() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const kycQuery = useKycSubmission();
  const [visible, setVisible] = useState(false);

  const isVerified = profileQuery.data?.isVerified ?? true;
  const kycStatus = kycQuery.data?.status ?? null;
  const kycReady = !kycQuery.isLoading;

  useEffect(() => {
    if (isVerified || !kycReady) return;
    // Dossier déjà déposé (en attente ou validé) : inutile d'insister.
    if (kycStatus === 'pending' || kycStatus === 'approved') return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      try {
        const lastSeen = Number((await SecureStore.getItemAsync(STORAGE_KEY)) ?? 0);
        const intervalMs = PROMPT_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
        if (Date.now() - lastSeen < intervalMs) return;
        // Petit délai pour laisser l'écran d'accueil s'installer d'abord.
        timer = setTimeout(() => {
          if (!cancelled) setVisible(true);
        }, 2500);
      } catch {
        // Stockage indisponible : on ne bloque jamais l'app pour un rappel.
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isVerified, kycStatus, kycReady]);

  const dismiss = () => {
    setVisible(false);
    SecureStore.setItemAsync(STORAGE_KEY, String(Date.now())).catch(() => {});
  };

  const startVerification = () => {
    dismiss();
    router.push('/kyc/upload-id');
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible statusBarTranslucent onRequestClose={dismiss}>
      <View className="flex-1 items-center justify-center bg-ink/[0.55] px-7">
        <View className="w-full rounded-[28px] bg-cream p-6">
          <Pressable
            onPress={dismiss}
            className="absolute right-4 top-4 z-10 h-9 w-9 items-center justify-center rounded-full bg-ink/[0.05]"
            hitSlop={6}
            accessibilityLabel="Plus tard"
          >
            <X size={16} color={colors.ink.muted} />
          </Pressable>

          <View className="mb-4 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-gold/[0.14]">
              <ShieldCheck size={30} color={colors.gold.DEFAULT} strokeWidth={2} />
            </View>
          </View>

          <Text className="mb-2 text-center font-display text-[22px] leading-[28px] text-ink">
            Gagnez en crédibilité
          </Text>
          <Text className="mb-5 text-center font-body text-[13px] leading-[20px] text-ink-muted">
            Vérifiez votre identité en 2 minutes et obtenez votre badge. Les membres font bien plus
            confiance aux profils vérifiés.
          </Text>

          <View className="mb-6 rounded-2xl bg-white/[0.65] px-4 py-3.5" style={{ gap: 10 }}>
            <View className="flex-row items-center gap-2.5">
              <BadgeCheck size={15} color={colors.gold.DEFAULT} strokeWidth={2.4} />
              <Text className="flex-1 font-body-medium text-[12.5px] text-ink">
                Badge « Vérifié » visible sur votre profil
              </Text>
            </View>
            <View className="flex-row items-center gap-2.5">
              <Heart size={15} color={colors.brand.DEFAULT} strokeWidth={2.4} />
              <Text className="flex-1 font-body-medium text-[12.5px] text-ink">
                Plus de visites et plus de matches
              </Text>
            </View>
          </View>

          <GradientButton label="Me faire vérifier" onPress={startVerification} />
          <Pressable onPress={dismiss} className="mt-3 items-center py-2">
            <Text className="font-heading-semibold text-[12.5px] text-ink-muted">Plus tard</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
