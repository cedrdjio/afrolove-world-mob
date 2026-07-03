import { View, Text } from 'react-native';
import { ScreenBackground } from '@/shared/components/layout';
import { LoadingSpinner } from '@/shared/components/feedback';
import { BrandLogo } from '@/shared/components/ui/BrandLogo';

export function LoadingScreen() {
  return (
    <View className="flex-1">
      <ScreenBackground theme="cream" />
      <View className="flex-1 items-center justify-center px-8">
        <BrandLogo size={64} style={{ marginBottom: 28 }} />
        <LoadingSpinner />
        <Text className="mt-5 font-heading-semibold text-[12px] uppercase tracking-widest text-ink-muted">
          Chargement…
        </Text>
      </View>
    </View>
  );
}
