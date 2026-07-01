import { Pressable, View, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '@/shared/constants/theme';

interface ChoiceListEditorProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function ChoiceListEditor({ options, value, onChange }: ChoiceListEditorProps) {
  return (
    <View className="gap-2.5">
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            className={`flex-row items-center justify-between rounded-2xl border-[1.5px] px-4 py-4 ${
              selected ? 'border-brand/40 bg-brand/[0.08]' : 'border-white/90 bg-white/70'
            }`}
          >
            <Text className={`font-heading-semibold text-[14px] uppercase ${selected ? 'text-brand' : 'text-ink'}`}>
              {option}
            </Text>
            {selected ? <Check size={17} color={colors.brand.DEFAULT} strokeWidth={2.5} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
