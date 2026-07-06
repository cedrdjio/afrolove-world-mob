import { View } from 'react-native';
import { Slot } from 'expo-router';
import { BottomNavBar } from '@/shared/components/layout';
import { RequireCompletedOnboarding } from '@/modules/auth/components/RequireCompletedOnboarding';
import { useLocationSync } from '@/modules/profile/hooks/useLocationSync';
import { usePushSync } from '@/modules/notifications/hooks/usePush';
import { useNotificationsRealtime } from '@/modules/notifications/hooks/useNotifications';

export default function TabsLayout() {
  useLocationSync();
  usePushSync();
  useNotificationsRealtime();

  return (
    <RequireCompletedOnboarding>
      <View style={{ flex: 1 }}>
        <Slot />
        <BottomNavBar />
      </View>
    </RequireCompletedOnboarding>
  );
}
