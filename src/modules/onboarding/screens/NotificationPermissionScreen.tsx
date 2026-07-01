import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Bell } from 'lucide-react-native';
import { PermissionScreen } from '@/modules/onboarding/components/PermissionScreen';

export function NotificationPermissionScreen() {
  const router = useRouter();
  const goNext = () => router.push('/(onboarding)/finish');

  const handleEnable = async () => {
    try {
      await Notifications.requestPermissionsAsync();
    } catch {
      // expo-notifications' push registration isn't available in Expo Go
      // on Android (SDK 53+) and can throw on some devices/OS versions —
      // never let a permission prompt block onboarding.
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
