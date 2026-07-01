import { View } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/shared/constants/theme';

interface AvatarProps {
  source?: string | number;
  size?: number;
  ringColor?: string;
  ringWidth?: number;
}

export function Avatar({ source, size = 52, ringColor, ringWidth = 2.5 }: AvatarProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        borderWidth: ringColor ? ringWidth : 0,
        borderColor: ringColor,
        backgroundColor: colors.cream.bezel2,
      }}
    >
      {source ? (
        <Image
          source={typeof source === 'string' ? { uri: source } : source}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
      ) : null}
    </View>
  );
}
