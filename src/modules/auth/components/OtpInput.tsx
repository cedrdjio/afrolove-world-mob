import { useRef, useState } from 'react';
import { View, TextInput } from 'react-native';
import { colors } from '@/shared/constants/theme';

interface OtpInputProps {
  length?: number;
  onComplete?: (code: string) => void;
}

export function OtpInput({ length = 6, onComplete }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const next = [...digits];
    next[index] = text.slice(-1);
    setDigits(next);

    if (text && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
    if (next.every((d) => d !== '')) {
      onComplete?.(next.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row justify-between gap-2.5">
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
          keyboardType="number-pad"
          maxLength={1}
          className="h-14 rounded-2xl border-[1.5px] border-white/90 bg-white/70 text-center font-display text-[22px] text-ink"
          style={{
            flexBasis: 0,
            flexGrow: 1,
            minWidth: 0,
            shadowColor: colors.ink.soft,
            shadowOpacity: 0.07,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
          }}
        />
      ))}
    </View>
  );
}
