import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { colors } from '@/shared/constants/theme';

interface EditScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onSave: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
  saving?: boolean;
  scrollable?: boolean;
}

export function EditScreenLayout({
  title,
  subtitle,
  children,
  onSave,
  saveLabel = 'Enregistrer',
  saveDisabled = false,
  saving = false,
  scrollable = true,
}: EditScreenLayoutProps) {
  const router = useRouter();
  const Container = scrollable ? ScrollView : View;

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={230} color="rgba(106,79,192,0.1)" top={-50} right={-50} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 68, paddingBottom: 28 }}>
        <View className="mb-6 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
          </IconButton>
          <Text className="font-display text-[20px] text-ink">{title}</Text>
          <View style={{ width: 44 }} />
        </View>

        {subtitle ? <Text className="mb-5 font-body text-[13px] text-ink-muted">{subtitle}</Text> : null}

        <Container
          {...(scrollable ? { showsVerticalScrollIndicator: false, className: 'flex-1' } : { className: 'flex-1' })}
        >
          {children}
        </Container>

        <GradientButton
          label={saveLabel}
          onPress={onSave}
          disabled={saveDisabled}
          loading={saving}
          style={{ marginTop: 16 }}
        />
      </View>
    </View>
  );
}
