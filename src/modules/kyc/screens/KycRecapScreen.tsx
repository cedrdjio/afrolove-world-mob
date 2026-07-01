import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, IdCard, ShieldCheck, Send } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { PhotoPlaceholder } from '@/shared/components/ui/PhotoPlaceholder';
import { KycHeader } from '@/modules/kyc/components/KycHeader';
import { colors } from '@/shared/constants/theme';

const IDENTITY_INFO = [
  { label: 'Nom', value: 'Diallo' },
  { label: 'Prénom', value: 'Amira' },
  { label: 'Date naissance', value: '14/03/1998' },
  { label: 'Nationalité', value: 'Nigériane' },
];

export function KycRecapScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={210} color="rgba(201,134,42,0.08)" bottom={-40} left={-40} duration={10000} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 60, paddingBottom: 26 }}>
        <KycHeader step={3} />

        <View className="mb-[22px] items-center">
          <View className="mb-3.5 h-[68px] w-[68px] items-center justify-center rounded-[22px] border-[1.5px] border-success/25 bg-success/[0.1]">
            <Check size={32} color={colors.success} strokeWidth={1.8} />
          </View>
          <Text className="mb-1.5 text-center font-display text-[28px] uppercase leading-none text-ink">
            Dossier complet !{'\n'}
            <Text className="text-brand">Vérifiez avant envoi</Text>
          </Text>
          <Text className="text-center font-body text-[12px] leading-[18px] text-ink-muted">
            Tout semble bon. Soumettez pour validation sous 48h.
          </Text>
        </View>

        <View className="mb-[18px] gap-2.5">
          <View className="flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5">
            <View className="h-9 w-[52px] items-center justify-center rounded-lg border border-brand/20 bg-brand/[0.15]">
              <IdCard size={18} color={colors.brand.DEFAULT} />
            </View>
            <View className="flex-1">
              <Text className="mb-0.5 font-heading text-[13px] uppercase text-ink">CNI Recto + Verso</Text>
              <Text className="font-body text-[11px] text-ink-muted">2 photos · Qualité OK</Text>
            </View>
            <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-success/[0.12]">
              <Check size={12} color={colors.success} strokeWidth={2.8} />
            </View>
          </View>

          <View className="flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5">
            <View className="h-9 w-[52px] overflow-hidden rounded-lg">
              <PhotoPlaceholder seed={0} style={{ flex: 1 }} />
            </View>
            <View className="flex-1">
              <Text className="mb-0.5 font-heading text-[13px] uppercase text-ink">Selfie + Document</Text>
              <Text className="font-body text-[11px] text-ink-muted">Visage + CNI visibles</Text>
            </View>
            <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-success/[0.12]">
              <Check size={12} color={colors.success} strokeWidth={2.8} />
            </View>
          </View>

          <View className="rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5">
            <Text className="mb-2.5 font-heading text-[9.5px] uppercase tracking-widest text-ink/35">
              Informations extraites
            </Text>
            <View className="flex-row flex-wrap gap-x-4 gap-y-2.5">
              {IDENTITY_INFO.map((info) => (
                <View key={info.label} style={{ width: '45%' }}>
                  <Text className="mb-0.5 font-body-medium text-[9.5px] text-ink/[0.38]">{info.label}</Text>
                  <Text className="font-heading text-[13px] uppercase text-ink">{info.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="mb-4 flex-row items-center gap-2.5 rounded-2xl border border-success/[0.18] bg-success/[0.08] px-3.5 py-3">
          <ShieldCheck size={14} color={colors.success} />
          <Text className="flex-1 font-body text-[11.5px] leading-[16px] text-success">
            Documents chiffrés · Supprimés après vérification · Conforme RGPD
          </Text>
        </View>

        <GradientButton
          label="Soumettre mon dossier KYC"
          icon={<Send size={15} color="#fff" />}
          iconPosition="left"
          onPress={() => router.replace('/kyc/pending')}
        />
      </View>
    </View>
  );
}
