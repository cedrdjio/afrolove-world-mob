import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { images } from '@/shared/constants/images';
import { gradients } from '@/shared/constants/theme';

interface BrandLogoProps {
  /** Outer size in px. */
  size?: number;
  /**
   * plain — the transparent heart alone (charte: only on quiet backgrounds).
   * pastille — heart centered at 78% on a brume-gradient super-rounded tile,
   *            the official app-icon construction from the charte.
   * round — the official circular app icon asset.
   */
  variant?: 'plain' | 'pastille' | 'round';
  style?: StyleProp<ViewStyle>;
}

/** The AfriLove World heart is a transparent icon — never crop or recolor it;
 *  put it on a pastille when the background is busy. */
export function BrandLogo({ size = 64, variant = 'pastille', style }: BrandLogoProps) {
  if (variant === 'round') {
    return (
      <Image
        source={images.logoRound}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style as object]}
        contentFit="cover"
      />
    );
  }

  if (variant === 'plain') {
    return (
      <Image
        source={images.logoLight}
        style={[{ width: size, height: size }, style as object]}
        contentFit="contain"
      />
    );
  }

  return (
    <View style={style}>
      <LinearGradient
        colors={gradients.bezelLight}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.29,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.8)',
          shadowColor: '#5B3E9E',
          shadowOpacity: 0.22,
          shadowRadius: size * 0.2,
          shadowOffset: { width: 0, height: size * 0.08 },
          elevation: 6,
        }}
      >
        <Image
          source={images.logoLight}
          style={{ width: size * 0.78, height: size * 0.78 }}
          contentFit="contain"
        />
      </LinearGradient>
    </View>
  );
}
