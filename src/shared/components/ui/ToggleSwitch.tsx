import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ToggleSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleSwitch({ value, onChange }: ToggleSwitchProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onChange(!value);
      }}
      className={`h-7 w-12 justify-center rounded-full px-1 ${value ? 'bg-brand' : 'bg-ink/10'}`}
    >
      <View
        className="h-5 w-5 rounded-full bg-white"
        style={{ marginLeft: value ? 20 : 0, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3 }}
      />
    </Pressable>
  );
}
