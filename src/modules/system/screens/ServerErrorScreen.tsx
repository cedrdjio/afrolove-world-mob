import { useRouter } from 'expo-router';
import { ServerCrash } from 'lucide-react-native';
import { SystemStateScreen } from '@/modules/system/components/SystemStateScreen';

export function ServerErrorScreen() {
  const router = useRouter();

  return (
    <SystemStateScreen
      Icon={ServerCrash}
      title="Erreur serveur"
      description="Un problème technique est survenu de notre côté. Notre équipe a été notifiée."
      actionLabel="Réessayer"
      onAction={() => router.back()}
      iconColors={['#B41E14', '#6B0E0A']}
    />
  );
}
