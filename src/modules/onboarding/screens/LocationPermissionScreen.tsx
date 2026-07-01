import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';
import { PermissionScreen } from '@/modules/onboarding/components/PermissionScreen';

export function LocationPermissionScreen() {
  const router = useRouter();
  const goNext = () => router.push('/(onboarding)/notification-permission');

  const handleEnable = async () => {
    try {
      await Location.requestForegroundPermissionsAsync();
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
