import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import { OnboardingLayout } from '@/modules/onboarding/components/OnboardingLayout';
import { OnboardingHeader } from '@/modules/onboarding/components/OnboardingHeader';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { useOnboardingStore } from '@/modules/onboarding/stores/onboardingStore';
import { colors } from '@/shared/constants/theme';

export function NameScreen() {
  const router = useRouter();
  const firstName = useOnboardingStore((s) => s.firstName);
  const setFirstName = useOnboardingStore((s) => s.setFirstName);
  const lastName = useOnboardingStore((s) => s.lastName);
  const setLastName = useOnboardingStore((s) => s.setLastName);
  const isValid = firstName.trim().length >= 2 && lastName.trim().length >= 2;

  return (
    <OnboardingLayout orbPosition="topRight">
      <OnboardingHeader step={1} total={8} />

      <View className="flex-1">
        <View
          className="mb-[22px] h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-white/70"
          style={{ shadowColor: colors.brand.DEFAULT, shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 4 } }}
        >
          <User size={28} color={colors.brand.DEFAULT} strokeWidth={1.8} />
        </View>
        <Text className="mb-2.5 font-display text-[38px] uppercase leading-none text-ink">
          Comment{'\n'}
          <Text className="text-brand">vous appelez-vous ?</Text>
        </Text>
        <Text className="mb-7 font-body text-[13.5px] leading-[21px] text-ink-muted">
          Votre prénom sera visible publiquement ; votre nom reste privé.
        </Text>

        <View className="mb-3 flex-row items-center gap-2.5 rounded-[18px] border-2 border-brand/35 bg-white/70 px-[22px] py-5">
          <TextInput
            autoFocus
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Prénom"
            placeholderTextColor="rgba(46,36,64,0.2)"
            className="flex-1 font-display text-[24px] text-ink"
          />
        </View>
        <View className="mb-3 flex-row items-center gap-2.5 rounded-[18px] border-2 border-white/90 bg-white/70 px-[22px] py-5">
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Nom"
            placeholderTextColor="rgba(46,36,64,0.2)"
            className="flex-1 font-display text-[24px] text-ink"
          />
        </View>
        <Text className="font-body text-[11px] text-ink/30">Au moins 2 caractères chacun.</Text>
      </View>

      <GradientButton
        label="Continuer"
        disabled={!isValid}
        onPress={() => router.push('/(onboarding)/gender')}
      />
    </OnboardingLayout>
  );
}
