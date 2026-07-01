import { View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStore } from '@/shared/stores/networkStore';
import { SystemStateScreen } from '@/modules/system/components/SystemStateScreen';

/**
 * Sits above the entire navigation stack (mounted once in the root
 * layout) so losing connectivity always shows the dedicated Offline
 * screen no matter which screen the user is on, and it disappears the
 * instant NetInfo reports connectivity again — no navigation involved.
 */
export function OfflineOverlay() {
  const isOffline = useNetworkStore((s) => s.isOffline);

  if (!isOffline) return null;

  return (
    <View style={{ position: 'absolute', inset: 0 }}>
      <SystemStateScreen
        Icon={WifiOff}
        title="Vous êtes hors ligne"
        description="AfroLove World a besoin d'internet. La connexion sera vérifiée automatiquement."
        actionLabel="Vérifier la connexion"
        onAction={() => NetInfo.fetch()}
      />
    </View>
  );
}
