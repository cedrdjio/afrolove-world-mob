import { useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { AtSign } from 'lucide-react-native';
import { OnboardingLayout } from '@/modules/onboarding/components/OnboardingLayout';
import { OnboardingHeader } from '@/modules/onboarding/components/OnboardingHeader';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { useOnboardingStore } from '@/modules/onboarding/stores/onboardingStore';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { colors } from '@/shared/constants/theme';

/** Étape pseudo — un seul champ, prérempli avec le pseudo choisi à
 *  l'inscription (ou le prénom Google). Pas de nom civil : on ne demande
 *  jamais deux fois la même chose. */
export function NameScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = useOnboardingStore((s) => s.firstName);
  const setFirstName = useOnboardingStore((s) => s.setFirstName);
  const isValid = firstName.trim().length >= 2;

  useEffect(() => {
    if (firstName) return;
    const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
    const prefill =
      (typeof metadata.first_name === 'string' && metadata.first_name) ||
      (typeof metadata.given_name === 'string' && metadata.given_name) ||
      (typeof metadata.name === 'string' && metadata.name) ||
      '';
    if (prefill) setFirstName(prefill);
  }, [firstName, setFirstName, user]);

  return (
    <OnboardingLayout orbPosition="topRight">
      <OnboardingHeader step={1} total={8} />

      <View className="flex-1">
        <View
          className="mb-[22px] h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-white/[0.55]"
          style={{ shadowColor: colors.brand.DEFAULT, shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 4 } }}
        >
          <AtSign size={28} color={colors.brand.DEFAULT} strokeWidth={1.8} />
        </View>
        <Text className="mb-2.5 font-display text-[34px] leading-[1.08] text-ink">
          Ton <Text className="text-brand">pseudo</Text>
        </Text>
        <Text className="mb-7 font-body text-[13.5px] leading-[21px] text-ink-muted">
          C'est le nom que verront les autres membres. Tu pourras le changer plus tard.
        </Text>

        <View className="mb-3 flex-row items-center gap-2.5 rounded-[18px] border-2 border-brand/35 bg-white/[0.55] px-[22px] py-5">
          <TextInput
            autoFocus
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Ton pseudo"
            placeholderTextColor="rgba(46,36,64,0.2)"
            className="flex-1 font-display text-[24px] text-ink"
          />
        </View>
        <Text className="font-body text-[11px] text-ink/30">Au moins 2 caractères.</Text>
      </View>

      <GradientButton
        label="Continuer"
        disabled={!isValid}
        onPress={() => router.push('/(onboarding)/gender')}
      />
    </OnboardingLayout>
  );
}
