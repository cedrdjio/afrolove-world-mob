import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';

/**
 * Lavender gradient placeholder used wherever a user photo will eventually
 * load from Supabase Storage — the whole range stays inside the charte
 * (lavande → aubergine), no warm/orange tones.
 */
const PALETTES: readonly [string, string][] = [
  ['#C3B1E1', '#7C5CBF'],
  ['#9B7EDE', '#5B3E9E'],
  ['#8B69D6', '#4A2C7F'],
  ['#A98FD8', '#6A4FC0'],
  ['#7C5CBF', '#3A2B4F'],
];

interface PhotoPlaceholderProps {
  seed?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  showIcon?: boolean;
  iconSize?: number;
}

export function PhotoPlaceholder({ seed = 0, radius = 0, style, showIcon = false, iconSize = 22 }: PhotoPlaceholderProps) {
  const [start, end] = PALETTES[Math.abs(seed) % PALETTES.length];

  return (
    <LinearGradient
      colors={[start, end]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[{ borderRadius: radius, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, style]}
    >
      {showIcon ? <User size={iconSize} color="rgba(255,255,255,0.55)" strokeWidth={1.6} /> : null}
    </LinearGradient>
  );
}

export function photoSeedFromString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}
