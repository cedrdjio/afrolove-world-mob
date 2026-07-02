import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { PermissionScreen } from '@/modules/onboarding/components/PermissionScreen';
import { useAuthStore } from '@/modules/auth/stores/authStore';
import { pushService } from '@/modules/notifications/services/pushService';

export function NotificationPermissionScreen() {
  const router = useRouter();
  const goNext = () => router.push('/(onboarding)/finish');

  const handleEnable = async () => {
    try {
      // Imported lazily: on Android Expo Go (SDK 53+), merely requiring
      // expo-notifications throws immediately because remote push support
      // was pulled from Expo Go. Deferring the import into this try/catch
      // keeps that crash from taking down the whole onboarding screen —
      // a development build is required for real push registration.
      const Notifications = await import('expo-notifications');
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        // Register right away (fire-and-forget) so the very first match
        // already lands as a push, without waiting for the next app start.
        const userId = useAuthStore.getState().user?.id;
        if (userId) pushService.registerDevice(userId);
      }
    } catch {
      // Never let a permission prompt block onboarding.
    }
    goNext();
  };

  return (
    <PermissionScreen
      Icon={Bell}
      title={'Restez\ninformé(e)'}
      description="Recevez une alerte dès qu'un match, un message ou un like arrive — ne manquez aucune opportunité."
      primaryLabel="Activer les notifications"
      onPrimaryPress={handleEnable}
      onSkip={goNext}
    />
  );
}
