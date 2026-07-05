import { useMemo } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Cake } from 'lucide-react-native';
import { OnboardingLayout } from '@/modules/onboarding/components/OnboardingLayout';
import { OnboardingHeader } from '@/modules/onboarding/components/OnboardingHeader';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { useOnboardingStore } from '@/modules/onboarding/stores/onboardingStore';
import { colors } from '@/shared/constants/theme';

function calculateAge(day: string, month: string, year: string): number | null {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!d || !m || !y || y < 1900) return null;
  const birth = new Date(y, m - 1, d);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

function DateField({
  label,
  value,
  onChangeText,
  maxLength,
  max,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  maxLength: number;
  max?: number;
}) {
  return (
    <View className="flex-1 items-center gap-2 rounded-[18px] border-2 border-white/70 bg-white/[0.45] px-3 py-4">
      <TextInput
        value={value}
        onChangeText={(t) => {
          const digits = t.replace(/[^0-9]/g, '').slice(0, maxLength);
          const clamped = max && digits !== '' && Number(digits) > max ? String(max) : digits;
          onChangeText(clamped);
        }}
        keyboardType="number-pad"
        maxLength={maxLength}
        placeholder={label}
        placeholderTextColor="rgba(46,36,64,0.2)"
        className="w-full text-center font-display text-[24px] text-ink"
      />
      <Text className="font-heading text-[9px] text-ink-faint">{label}</Text>
    </View>
  );
}

export function BirthdayScreen() {
  const router = useRouter();
  const birthDate = useOnboardingStore((s) => s.birthDate);
  const setBirthDate = useOnboardingStore((s) => s.setBirthDate);

  const age = useMemo(
    () => calculateAge(birthDate.day, birthDate.month, birthDate.year),
    [birthDate.day, birthDate.month, birthDate.year],
  );
  const isValid = age !== null && age >= 18;

  return (
    <OnboardingLayout orbPosition="topLeft">
      <OnboardingHeader step={3} total={8} />

      <View
        className="mb-5 h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-white/[0.55]"
        style={{ shadowColor: colors.brand.DEFAULT, shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 4 } }}
      >
        <Cake size={28} color={colors.brand.DEFAULT} strokeWidth={1.8} />
      </View>
      <Text className="mb-2.5 font-display text-[38px] leading-none text-ink">
        Votre date{'\n'}
        <Text className="text-brand">de naissance</Text>
      </Text>
      <Text className="mb-7 font-body text-[13.5px] leading-[21px] text-ink-muted">
        Vous devez avoir au moins 18 ans pour utiliser AfriLove World.
      </Text>

      <View className="flex-1">
        <View className="flex-row gap-3">
          <DateField label="Jour" value={birthDate.day} onChangeText={(v) => setBirthDate({ day: v })} maxLength={2} max={31} />
          <DateField label="Mois" value={birthDate.month} onChangeText={(v) => setBirthDate({ month: v })} maxLength={2} max={12} />
          <View style={{ flex: 1.4 }}>
            <DateField label="Année" value={birthDate.year} onChangeText={(v) => setBirthDate({ year: v })} maxLength={4} />
          </View>
        </View>
        {age !== null ? (
          <Text className={`mt-3 font-body text-[12px] ${isValid ? 'text-ink-muted' : 'text-danger'}`}>
            {isValid ? `Vous avez ${age} ans.` : "Vous devez avoir au moins 18 ans."}
          </Text>
        ) : null}
      </View>

      <GradientButton label="Continuer" disabled={!isValid} onPress={() => router.push('/(onboarding)/looking-for')} />
    </OnboardingLayout>
  );
}
