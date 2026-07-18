import { View } from 'react-native';
import { Slot } from 'expo-router';
import { BottomNavBar } from '@/shared/components/layout';
import { RequireCompletedOnboarding } from '@/modules/auth/components/RequireCompletedOnboarding';
import { useLocationSync } from '@/modules/profile/hooks/useLocationSync';
import { usePushSync } from '@/modules/notifications/hooks/usePush';
import { useNotificationsRealtime } from '@/modules/notifications/hooks/useNotifications';
import { usePresenceSync } from '@/shared/stores/presenceStore';
import { VerificationPromptModal } from '@/modules/kyc/components/VerificationPromptModal';

export default function TabsLayout() {
  useLocationSync();
  usePushSync();
  useNotificationsRealtime();
  usePresenceSync();

  return (
    <RequireCompletedOnboarding>
      <View style={{ flex: 1 }}>
        <Slot />
        <BottomNavBar />
        {/* Rappel périodique « faites-vous vérifier » (badge de crédibilité). */}
        <VerificationPromptModal />
      </View>
    </RequireCompletedOnboarding>
  );
}
