import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { PermissionScreen } from '@/modules/onboarding/components/PermissionScreen';

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
      await Notifications.requestPermissionsAsync();
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
