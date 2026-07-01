import { View } from 'react-native';
import { Slot } from 'expo-router';
import { BottomNavBar } from '@/shared/components/layout';
import { RequireCompletedOnboarding } from '@/modules/auth/components/RequireCompletedOnboarding';

export default function TabsLayout() {
  return (
    <RequireCompletedOnboarding>
      <View style={{ flex: 1 }}>
        <Slot />
        <BottomNavBar />
      </View>
    </RequireCompletedOnboarding>
  );
}
