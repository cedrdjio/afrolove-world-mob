import { useFonts } from 'expo-font';
import { fontMap } from '@/shared/constants/theme';

export function useAppFonts() {
  const [loaded, error] = useFonts(fontMap);
  return { loaded, error };
}
