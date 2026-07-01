import { View, Text } from 'react-native';

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
}

export function InfoRow({ icon, label, value, isLast = false }: InfoRowProps) {
  return (
    <View className={`flex-row items-center gap-3.5 py-3.5 ${isLast ? '' : 'border-b border-ink/[0.06]'}`}>
      <View className="h-9 w-9 items-center justify-center rounded-full bg-brand/[0.08]">{icon}</View>
      <View className="flex-1">
        <Text className="mb-0.5 font-heading text-[9.5px] uppercase tracking-widest text-ink-faint">{label}</Text>
        <Text className="font-heading-semibold text-[14px] text-ink">{value}</Text>
      </View>
    </View>
  );
}
