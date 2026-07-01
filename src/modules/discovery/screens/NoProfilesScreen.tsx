import { Users } from 'lucide-react-native';
import { EmptyState } from '@/shared/components/feedback';
import { colors } from '@/shared/constants/theme';

export function NoProfilesState({ onOpenFilters }: { onOpenFilters: () => void }) {
  return (
    <EmptyState
      icon={<Users size={34} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
      title="Vous avez tout vu !"
      description="Il n'y a plus de nouveaux profils près de chez vous. Élargissez votre rayon de recherche pour découvrir plus de monde."
      actionLabel="Élargir mes critères"
      onAction={onOpenFilters}
    />
  );
}
