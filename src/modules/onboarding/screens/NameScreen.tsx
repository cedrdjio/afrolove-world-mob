import { useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { UserRound, ShieldCheck } from 'lucide-react-native';
import { OnboardingLayout } from '@/modules/onboarding/components/OnboardingLayout';
import { OnboardingHeader } from '@/modules/onboarding/components/OnboardingHeader';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { useOnboardingStore } from '@/modules/onboarding/stores/onboardingStore';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { colors } from '@/shared/constants/theme';

/** Étape identité — prénom ET nom réels. Le nom complet est indispensable
 *  pour vérifier l'identité du membre (badge vérifié / KYC) : il doit
 *  correspondre à la pièce d'identité fournie. Seul le prénom est montré
 *  aux autres membres. */
export function NameScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = useOnboardingStore((s) => s.firstName);
  const lastName = useOnboardingStore((s) => s.lastName);
  const setFirstName = useOnboardingStore((s) => s.setFirstName);
  const setLastName = useOnboardingStore((s) => s.setLastName);
  const isValid = firstName.trim().length >= 2 && lastName.trim().length >= 2;

  useEffect(() => {
    const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
    if (!firstName) {
      const prefill =
        (typeof metadata.first_name === 'string' && metadata.first_name) ||
        (typeof metadata.given_name === 'string' && metadata.given_name) ||
        (typeof metadata.name === 'string' && String(metadata.name).split(' ')[0]) ||
        '';
      if (prefill) setFirstName(prefill);
    }
    if (!lastName) {
      const prefill =
        (typeof metadata.last_name === 'string' && metadata.last_name) ||
        (typeof metadata.family_name === 'string' && metadata.family_name) ||
        '';
      if (prefill) setLastName(prefill);
    }
  }, [firstName, lastName, setFirstName, setLastName, user]);

  return (
    <OnboardingLayout orbPosition="topRight">
      <OnboardingHeader step={1} total={8} />

      <View className="flex-1">
        <View
          className="mb-[22px] h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-white/[0.55]"
          style={{ shadowColor: colors.brand.DEFAULT, shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 4 } }}
        >
          <UserRound size={28} color={colors.brand.DEFAULT} strokeWidth={1.8} />
        </View>
        <Text className="mb-2.5 font-display text-[34px] leading-[1.08] text-ink">
          Ton <Text className="text-brand">identité</Text>
        </Text>
        <Text className="mb-7 font-body text-[13.5px] leading-[21px] text-ink-muted">
          Ton prénom sera visible par les autres membres. Ton nom reste privé et sert uniquement à
          vérifier ton identité.
        </Text>

        <Text className="mb-2 font-heading-semibold text-[11.5px] text-ink/45">Prénom</Text>
        <View className="mb-4 flex-row items-center gap-2.5 rounded-[18px] border-2 border-brand/35 bg-white/[0.55] px-[22px] py-4">
          <TextInput
            autoFocus
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Ton prénom"
            autoComplete="given-name"
            placeholderTextColor="rgba(46,36,64,0.2)"
            className="flex-1 font-display text-[22px] text-ink"
          />
        </View>

        <Text className="mb-2 font-heading-semibold text-[11.5px] text-ink/45">Nom</Text>
        <View className="mb-3 flex-row items-center gap-2.5 rounded-[18px] border-2 border-brand/35 bg-white/[0.55] px-[22px] py-4">
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Ton nom de famille"
            autoComplete="family-name"
            placeholderTextColor="rgba(46,36,64,0.2)"
            className="flex-1 font-display text-[22px] text-ink"
          />
        </View>

        <View className="flex-row items-center gap-1.5">
          <ShieldCheck size={12} color={colors.brand.DEFAULT} strokeWidth={2.2} />
          <Text className="flex-1 font-body text-[11px] text-ink/40">
            Utilise ton vrai nom : il devra correspondre à ta pièce d'identité pour obtenir le badge
            vérifié.
          </Text>
        </View>
      </View>

      <GradientButton
        label="Continuer"
        disabled={!isValid}
        onPress={() => router.push('/(onboarding)/gender')}
      />
    </OnboardingLayout>
  );
}
