import { View, Text, Pressable } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { colors } from '@/shared/constants/theme';

function Stepper({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <View className="flex-row items-center gap-4">
      <Pressable onPress={() => onChange(Math.max(min, value - 1))}>
        <GlassSurface variant="light" radius={16} style={{ width: 40, height: 40 }}>
          <View className="h-10 w-10 items-center justify-center">
            <Minus size={16} color={colors.ink.DEFAULT} />
          </View>
        </GlassSurface>
      </Pressable>
      <Text className="w-12 text-center font-display text-[22px] text-ink">{value}</Text>
      <Pressable onPress={() => onChange(Math.min(max, value + 1))}>
        <GlassSurface variant="light" radius={16} style={{ width: 40, height: 40 }}>
          <View className="h-10 w-10 items-center justify-center">
            <Plus size={16} color={colors.ink.DEFAULT} />
          </View>
        </GlassSurface>
      </Pressable>
    </View>
  );
}

interface RangeStepperProps {
  min: number;
  max: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  unit?: string;
}

export function RangeStepper({ min, max, low, high, onChange, unit }: RangeStepperProps) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-5 py-5">
      <Stepper value={low} onChange={(v) => onChange(Math.min(v, high), high)} min={min} max={max} />
      <Text className="font-body-medium text-[12px] text-ink-muted">{unit ?? 'à'}</Text>
      <Stepper value={high} onChange={(v) => onChange(low, Math.max(v, low))} min={min} max={max} />
    </View>
  );
}
