import { forwardRef, useState } from 'react';
import { TextInput, View, Text, Pressable, type TextInputProps } from 'react-native';
import { cn } from '@/shared/utils/cn';
import { colors } from '@/shared/constants/theme';

interface GlassInputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  error?: string;
}

export const GlassInput = forwardRef<TextInput, GlassInputProps>(
  ({ label, icon, rightIcon, onRightIconPress, error, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <View className="mb-3">
        {label ? (
          <Text className="mb-2 font-heading-semibold text-[9.5px] uppercase tracking-widest text-ink-faint">
            {label}
          </Text>
        ) : null}
        <View
          className={cn(
            'flex-row items-center gap-2.5 rounded-2xl border-[1.5px] bg-white/70 px-[18px] py-3.5',
            focused || error ? 'border-brand/35' : 'border-white/90',
          )}
          style={{
            shadowColor: colors.ink.soft,
            shadowOpacity: 0.07,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          {icon}
          <TextInput
            ref={ref}
            placeholderTextColor="rgba(46,36,64,0.3)"
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={cn('flex-1 font-body text-[14px] text-ink', className)}
            {...props}
          />
          {rightIcon ? (
            <Pressable onPress={onRightIconPress} hitSlop={8}>
              {rightIcon}
            </Pressable>
          ) : null}
        </View>
        {error ? <Text className="mt-1.5 font-body text-[11px] text-danger">{error}</Text> : null}
      </View>
    );
  },
);
GlassInput.displayName = 'GlassInput';
