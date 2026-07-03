import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { PenLine } from 'lucide-react-native';
import { OnboardingLayout } from '@/modules/onboarding/components/OnboardingLayout';
import { OnboardingHeader } from '@/modules/onboarding/components/OnboardingHeader';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { useOnboardingStore } from '@/modules/onboarding/stores/onboardingStore';
import { colors } from '@/shared/constants/theme';

const MIN_BIO_LENGTH = 20;
const MAX_BIO_LENGTH = 300;

export function BioScreen() {
  const router = useRouter();
  const bio = useOnboardingStore((s) => s.bio);
  const setBio = useOnboardingStore((s) => s.setBio);
  const isValid = bio.trim().length >= MIN_BIO_LENGTH;

  return (
    <OnboardingLayout orbPosition="bottomLeft">
      <OnboardingHeader step={6} total={8} />

      <View
        className="mb-5 h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-white/70"
        style={{ shadowColor: colors.brand.DEFAULT, shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 4 } }}
      >
        <PenLine size={26} color={colors.brand.DEFAULT} strokeWidth={1.8} />
      </View>
      <Text className="mb-2 font-display text-[36px] uppercase leading-none text-ink">Parlez-nous{'\n'}de vous</Text>
      <Text className="mb-6 font-body text-[13px] leading-5 text-ink-muted">
        Une bonne bio attire 3× plus de matches. Soyez authentique.
      </Text>

      <View className="flex-1 rounded-[18px] border-2 border-brand/35 bg-white/70 p-[18px]">
        <TextInput
          autoFocus
          value={bio}
          onChangeText={(text) => setBio(text.slice(0, MAX_BIO_LENGTH))}
          placeholder="Passionné(e) de voyages, toujours partant(e) pour un bon plat et de belles conversations…"
          placeholderTextColor="rgba(46,36,64,0.25)"
          multiline
          textAlignVertical="top"
          className="flex-1 font-body text-[15px] leading-[22px] text-ink"
        />
      </View>
      <Text className="mt-2 text-right font-body text-[11px] text-ink/30">
        {bio.trim().length}/{MAX_BIO_LENGTH} · min. {MIN_BIO_LENGTH}
      </Text>

      <GradientButton
        label="Continuer"
        disabled={!isValid}
        onPress={() => router.push('/(onboarding)/upload-photos')}
        style={{ marginTop: 12 }}
      />
    </OnboardingLayout>
  );
}
