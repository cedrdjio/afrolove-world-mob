import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';
import { PermissionScreen } from '@/modules/onboarding/components/PermissionScreen';
import { useAuthStore } from '@/modules/auth/stores/authStore';
import { locationService } from '@/modules/profile/services/locationService';

export function LocationPermissionScreen() {
  const router = useRouter();
  const goNext = () => router.push('/(onboarding)/notification-permission');

  const handleEnable = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        // Persist the position right away (fire-and-forget) so proximity
        // search works from the very first discovery session — don't make
        // the user wait on GPS + reverse geocoding to continue onboarding.
        const userId = useAuthStore.getState().user?.id;
        if (userId) locationService.captureAndSaveLocation(userId);
      }
    } catch {
      // Never let a permission prompt failure block onboarding.
    }
    goNext();
  };

  return (
    <PermissionScreen
      Icon={MapPin}
      title={'Activez votre\nlocalisation'}
      description="Trouvez des membres de la communauté près de chez vous et affinez vos rencontres par distance."
      primaryLabel="Activer la localisation"
      onPrimaryPress={handleEnable}
      onSkip={goNext}
    />
  );
}
