import { TextInput } from 'react-native';
import { colors } from '@/shared/constants/theme';

interface OtpInputProps {
  onComplete?: (code: string) => void;
}

// A single field rather than a fixed grid of boxes: Supabase's email OTP
// length isn't guaranteed to be 6 digits (it depends on project config), so
// hardcoding a box count silently truncates longer codes. This accepts
// whatever length arrives and lets the user paste the code straight from
// the email.
export function OtpInput({ onComplete }: OtpInputProps) {
  return (
    <TextInput
      onChangeText={(text) => onComplete?.(text.trim())}
      keyboardType="number-pad"
      autoComplete="one-time-code"
      textContentType="oneTimeCode"
      placeholder="••••••"
      placeholderTextColor="rgba(26,8,4,0.25)"
      className="h-14 rounded-2xl border-[1.5px] border-white/90 bg-white/70 text-center font-display text-[22px] text-ink"
      style={{
        letterSpacing: 6,
        shadowColor: colors.ink.soft,
        shadowOpacity: 0.07,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      }}
    />
  );
}
