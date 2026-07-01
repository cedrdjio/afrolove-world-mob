import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { GhostButton } from '@/shared/components/ui/GhostButton';

const REASONS = ['Document illisible ou flou', "Le visage n'est pas clairement visible", 'Informations incohérentes'];

export function KycRejectedScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={260} color="rgba(180,30,20,0.18)" bottom={140} right={-40} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-7 h-24 w-24 items-center justify-center rounded-full border-[1.5px] border-danger/30 bg-danger/[0.12]">
          <AlertTriangle size={40} color="#E85A4E" strokeWidth={1.6} />
        </View>

        <Text className="mb-3 text-center font-display-black text-[28px] uppercase text-white">
          Vérification refusée
        </Text>
        <Text className="mb-6 text-center font-body text-[13.5px] leading-[21px] text-white/50">
          Nous n'avons pas pu valider votre dossier pour la raison suivante :
        </Text>

        <View className="mb-9 w-full gap-2.5 rounded-2xl border border-white/[0.14] bg-white/[0.08] p-4">
          {REASONS.map((reason, i) => (
            <View key={reason} className="flex-row items-start gap-2.5">
              <View className="mt-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
              <Text className={`flex-1 font-body text-[12.5px] leading-[18px] ${i === 0 ? 'text-white/85' : 'text-white/40'}`}>
                {reason}
              </Text>
            </View>
          ))}
        </View>

        <GradientButton label="Soumettre un nouveau dossier" onPress={() => router.replace('/kyc/upload-id')} style={{ width: '100%', marginBottom: 12 }} />
        <GhostButton label="Contacter le support" tone="onDark" onPress={() => router.back()} />
      </View>
    </View>
  );
}
