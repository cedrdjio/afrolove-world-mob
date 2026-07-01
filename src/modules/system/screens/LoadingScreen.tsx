import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { ScreenBackground } from '@/shared/components/layout';
import { LoadingSpinner } from '@/shared/components/feedback';
import { images } from '@/shared/constants/images';

export function LoadingScreen() {
  return (
    <View className="flex-1">
      <ScreenBackground theme="cream" />
      <View className="flex-1 items-center justify-center px-8">
        <Image source={images.logoLight} style={{ width: 64, height: 64, borderRadius: 18, marginBottom: 28 }} contentFit="cover" />
        <LoadingSpinner />
        <Text className="mt-5 font-heading-semibold text-[12px] uppercase tracking-widest text-ink-muted">
          Chargement…
        </Text>
      </View>
    </View>
  );
}
