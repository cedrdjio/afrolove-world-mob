import { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ArrowLeft } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { Avatar } from '@/shared/components/ui/Avatar';
import { REPORT_REASONS } from '@/modules/reports/constants/reasons';
import { colors } from '@/shared/constants/theme';

export function ReportUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={210} color="rgba(180,30,20,0.07)" top={-50} right={-50} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 68, paddingBottom: 28 }}>
        <View className="mb-6 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
          </IconButton>
          <Text className="font-display text-[20px] uppercase text-ink">Signaler</Text>
          <View style={{ width: 44 }} />
        </View>

        <View className="mb-5 flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5">
          <Avatar seed={id ?? '1'} size={44} />
          <Text className="font-heading-semibold text-[14px] uppercase text-ink">
            Signalement du profil #{id}
          </Text>
        </View>

        <Text className="mb-2.5 font-heading text-[11px] uppercase tracking-widest text-ink/40">
          Pourquoi signalez-vous ce profil ?
        </Text>
        <View className="mb-4 gap-2">
          {REPORT_REASONS.map((reason) => {
            const selected = selectedReason === reason.key;
            return (
              <Pressable
                key={reason.key}
                onPress={() => setSelectedReason(reason.key)}
                className={`flex-row items-center justify-between rounded-2xl border-[1.5px] px-4 py-3.5 ${
                  selected ? 'border-danger/40 bg-danger/[0.06]' : 'border-white/90 bg-white/70'
                }`}
              >
                <View className="flex-1 pr-3">
                  <Text className={`mb-0.5 font-heading-semibold text-[13.5px] uppercase ${selected ? 'text-danger' : 'text-ink'}`}>
                    {reason.label}
                  </Text>
                  <Text className="font-body text-[11px] text-ink-muted">{reason.description}</Text>
                </View>
                {selected ? <Check size={17} color="#B41E14" strokeWidth={2.5} /> : null}
              </Pressable>
            );
          })}
        </View>

        <TextInput
          value={details}
          onChangeText={setDetails}
          placeholder="Détails supplémentaires (optionnel)"
          placeholderTextColor="rgba(26,8,4,0.25)"
          multiline
          className="mb-4 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5 font-body text-[13px] text-ink"
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <GradientButton
          label="Envoyer le signalement"
          disabled={!selectedReason}
          onPress={() => router.replace('/reports/confirmation')}
        />
      </View>
    </View>
  );
}
