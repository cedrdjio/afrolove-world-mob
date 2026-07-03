import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';

/**
 * Warm gradient placeholder used wherever a user photo will eventually load
 * from Supabase Storage. No business/data logic is wired up yet, so this
 * keeps every card/avatar visually complete without fabricating fake photos.
 */
const PALETTES: readonly [string, string][] = [
  ['#D4904A', '#7A3018'],
  ['#C87030', '#5A2010'],
  ['#E0A94A', '#8A5010'],
  ['#D4774A', '#9A3C1C'],
  ['#9B7EDE', '#6B2810'],
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
