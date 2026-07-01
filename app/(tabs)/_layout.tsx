import { View } from 'react-native';
import { Slot } from 'expo-router';
import { BottomNavBar } from '@/shared/components/layout';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
      <BottomNavBar />
    </View>
  );
}
