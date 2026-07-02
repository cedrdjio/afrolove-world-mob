import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Check, IdCard, ScanLine, ArrowRight, BookOpen, Car } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { KycHeader } from '@/modules/kyc/components/KycHeader';
import { useKycStore } from '@/modules/kyc/stores/kycStore';
import { useKycSubmission } from '@/modules/kyc/hooks/useKyc';
import { colors, gradients } from '@/shared/constants/theme';

const DOCUMENT_TYPES: { key: 'cni' | 'passport' | 'license'; label: string; Icon: LucideIcon }[] = [
  { key: 'cni', label: 'CNI', Icon: IdCard },
  { key: 'passport', label: 'Passeport', Icon: BookOpen },
  { key: 'license', label: 'Permis', Icon: Car },
];

const TIPS = [
  'Document entier visible, non coupé',
  'Bonne luminosité, sans reflet',
  'Informations lisibles et nettes',
];

export function UploadIdScreen() {
  const router = useRouter();
  const { docType, frontUri, backUri, setDocType, setFrontUri, setBackUri } = useKycStore();
  const submission = useKycSubmission();

  // A file already under review (or approved) must not be re-opened — land
  // on the status screen instead of letting the user re-capture for nothing.
  useEffect(() => {
    if (submission.data?.status === 'pending') router.replace('/kyc/pending');
    else if (submission.data?.status === 'approved') router.replace('/kyc/approved');
  }, [submission.data?.status, router]);

  const pickImage = async (side: 'front' | 'back') => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, aspect: [3, 2] });
    if (!result.canceled && result.assets[0]) {
      if (side === 'front') setFrontUri(result.assets[0].uri);
      else setBackUri(result.assets[0].uri);
    }
  };

  const bothCaptured = frontUri && backUri;

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={220} color="rgba(200,96,64,0.08)" top={-50} right={-50} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 60, paddingBottom: 26 }}>
        <KycHeader step={1} />

        <View
          className="mb-3.5 h-[60px] w-[60px] items-center justify-center rounded-[18px] bg-white/70"
          style={{ shadowColor: colors.brand.DEFAULT, shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } }}
        >
          <IdCard size={28} color={colors.brand.DEFAULT} strokeWidth={1.6} />
        </View>
        <Text className="mb-1.5 font-display text-[30px] uppercase leading-none text-ink">
          Votre pièce{'\n'}
          <Text className="text-brand">d'identité</Text>
        </Text>
        <Text className="mb-[18px] font-body text-[12.5px] leading-[19px] text-ink-muted">
          Choisissez le type de document puis photographiez recto et verso.
        </Text>

        <View className="mb-[18px] flex-row gap-2.5">
          {DOCUMENT_TYPES.map((doc) => {
            const selected = docType === doc.key;
            return (
              <Pressable
                key={doc.key}
                onPress={() => setDocType(doc.key)}
                className={`flex-1 items-center rounded-2xl border-[1.5px] py-3.5 ${
                  selected ? 'border-brand/30 bg-brand/[0.1]' : 'border-white/[0.88] bg-white/65'
                }`}
              >
                <View style={{ marginBottom: 6 }}>
                  <doc.Icon size={22} color={selected ? colors.brand.DEFAULT : colors.ink.muted} strokeWidth={1.8} />
                </View>
                <Text className={`font-heading text-[11px] uppercase ${selected ? 'text-brand' : 'text-ink-muted'}`}>
                  {doc.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mb-4 flex-row gap-3">
          <Pressable
            onPress={() => pickImage('front')}
            style={{ aspectRatio: 3 / 2 }}
            className="flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl border-[1.5px] border-brand/[0.28] bg-brand/[0.06]"
          >
            {frontUri ? (
              <Image source={{ uri: frontUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <>
                <LinearGradient
                  colors={gradients.brand}
                  style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
                >
                  <ScanLine size={20} color="#fff" />
                </LinearGradient>
                <Text className="font-heading text-[10px] uppercase text-brand">Recto</Text>
              </>
            )}
            {frontUri ? (
              <View className="absolute right-1.5 top-1.5 h-[18px] w-[18px] items-center justify-center rounded-full bg-brand">
                <Check size={9} color="#fff" strokeWidth={3} />
              </View>
            ) : null}
          </Pressable>

          <Pressable
            onPress={() => pickImage('back')}
            style={{ aspectRatio: 3 / 2 }}
            className="flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-brand/[0.22] bg-white/55"
          >
            {backUri ? (
              <Image source={{ uri: backUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <>
                <IdCard size={26} color="rgba(200,96,64,0.45)" strokeWidth={1.5} />
                <Text className="font-heading text-[10px] uppercase text-brand/50">Verso</Text>
              </>
            )}
          </Pressable>
        </View>

        <View className="mb-4 rounded-2xl border-[1.5px] border-white/[0.88] bg-white/65 px-4 py-3.5">
          <Text className="mb-2 font-heading text-[9.5px] uppercase tracking-widest text-ink/[0.38]">
            Conseils pour une bonne photo
          </Text>
          <View className="gap-1.5">
            {TIPS.map((tip) => (
              <View key={tip} className="flex-row items-center gap-2">
                <View className="h-1.5 w-1.5 rounded-full bg-brand" />
                <Text className="font-body text-[12px] text-ink-muted">{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        <GradientButton
          label={backUri ? 'Continuer' : 'Photographier le verso'}
          icon={<ArrowRight size={14} color="#fff" />}
          iconPosition="right"
          disabled={!bothCaptured}
          onPress={() => router.push('/kyc/selfie')}
        />
      </View>
    </View>
  );
}
