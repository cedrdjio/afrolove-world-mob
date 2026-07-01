import { useRouter } from 'expo-router';
import { Inbox } from 'lucide-react-native';
import { SystemStateScreen } from '@/modules/system/components/SystemStateScreen';

export function EmptyScreen() {
  const router = useRouter();

  return (
    <SystemStateScreen
      Icon={Inbox}
      title="Rien à afficher"
      description="Il n'y a encore rien ici. Revenez plus tard ou explorez d'autres sections de l'application."
      actionLabel="Retour à l'accueil"
      onAction={() => router.replace('/(tabs)/discover')}
    />
  );
}
