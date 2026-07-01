import { useRouter } from 'expo-router';
import { WifiOff } from 'lucide-react-native';
import { SystemStateScreen } from '@/modules/system/components/SystemStateScreen';

export function OfflineScreen() {
  const router = useRouter();

  return (
    <SystemStateScreen
      Icon={WifiOff}
      title="Vous êtes hors ligne"
      description="Certaines fonctionnalités peuvent être limitées jusqu'à ce que la connexion soit rétablie."
      actionLabel="Réessayer"
      onAction={() => router.back()}
    />
  );
}
