import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { colors } from '@/shared/constants/theme';

interface SearchFieldLayoutProps {
  title: string;
  children: React.ReactNode;
  scrollable?: boolean;
}

export function SearchFieldLayout({ title, children, scrollable = true }: SearchFieldLayoutProps) {
  const router = useRouter();
  const Container = scrollable ? ScrollView : View;

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={220} color="rgba(200,96,64,0.1)" top={-50} right={-50} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 68, paddingBottom: 28 }}>
        <View className="mb-6 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <Text style={{ fontSize: 19, color: colors.ink.DEFAULT }}>←</Text>
          </IconButton>
          <Text className="font-display text-[20px] uppercase text-ink">{title}</Text>
          <View style={{ width: 44 }} />
        </View>

        <Container {...(scrollable ? { showsVerticalScrollIndicator: false, className: 'flex-1' } : { className: 'flex-1' })}>
          {children}
        </Container>

        <GradientButton label="Appliquer" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    </View>
  );
}
