import { useState } from 'react';
import { CloudOff } from 'lucide-react-native';
import { SystemStateScreen } from '@/modules/system/components/SystemStateScreen';

export function NoInternetScreen() {
  const [checking, setChecking] = useState(false);

  const handleRetry = () => {
    setChecking(true);
    setTimeout(() => setChecking(false), 1200);
  };

  return (
    <SystemStateScreen
      Icon={CloudOff}
      title="Pas de connexion"
      description="AfroLove World a besoin d'internet pour trouver vos prochaines rencontres. Vérifiez votre connexion."
      actionLabel={checking ? 'Vérification…' : 'Réessayer'}
      onAction={handleRetry}
    />
  );
}
