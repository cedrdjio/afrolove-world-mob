import { Wrench } from 'lucide-react-native';
import { SystemStateScreen } from '@/modules/system/components/SystemStateScreen';
import { gradients } from '@/shared/constants/theme';

export function MaintenanceScreen() {
  return (
    <SystemStateScreen
      Icon={Wrench}
      title="Maintenance en cours"
      description="AfriLove World est en cours de mise à jour pour vous offrir une meilleure expérience. Revenez dans quelques instants."
      iconColors={gradients.gold}
    />
  );
}
