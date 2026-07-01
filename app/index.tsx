import { View, ScrollView } from 'react-native';
import { Heart, Mail, Bell } from 'lucide-react-native';
import { ScreenBackground, GlowOrb, ScreenHeader } from '@/shared/components/layout';
import {
  DisplayText,
  BodyText,
  GradientButton,
  GhostButton,
  GlassInput,
  Chip,
  Avatar,
  VerifiedBadge,
  MatchBadge,
  ProgressSteps,
} from '@/shared/components/ui';
import { colors } from '@/shared/constants/theme';

export default function Index() {
  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={260} color="rgba(200,96,64,0.14)" top={-60} right={-60} />
      </ScreenBackground>
      <ScrollView contentContainerClassName="px-6 pb-10" style={{ paddingTop: 60 }}>
        <ScreenHeader title="Design System" />
        <DisplayText className="mb-1 text-[34px]">AfroLove World</DisplayText>
        <BodyText className="mb-6">Aperçu du système de design.</BodyText>

        <View className="mb-4 flex-row gap-3">
          <VerifiedBadge tone="chip" />
          <MatchBadge percent={94} />
        </View>

        <ProgressSteps total={7} current={3} />

        <View className="my-6 flex-row flex-wrap gap-2">
          <Chip label="🎵 Musique" selected />
          <Chip label="✈️ Voyage" selected />
          <Chip label="🍲 Cuisine" />
          <Chip label="🎨 Art" />
        </View>

        <View className="mb-6 flex-row items-center gap-3">
          <Avatar size={62} ringColor={colors.brand.DEFAULT} />
          <Avatar size={62} ringColor={colors.gold.DEFAULT} />
        </View>

        <GlassInput label="Email" icon={<Mail size={16} color="rgba(44,20,8,0.28)" />} placeholder="Adresse email" />

        <View className="mb-3" />
        <GradientButton label="Se connecter" icon={<Heart size={16} color="#fff" />} />
        <View className="mb-3" />
        <GhostButton label="Créer un compte" tone="onLight" />

        <View className="mt-6">
          <Bell size={20} color={colors.ink.DEFAULT} />
        </View>
      </ScrollView>
    </View>
  );
}
