import { EmptyState } from '@/shared/components/feedback';

export function NoProfilesState({ onOpenFilters }: { onOpenFilters: () => void }) {
  return (
    <EmptyState
      title="Vous avez tout vu !"
      description="Il n'y a plus de nouveaux profils près de chez vous. Élargissez votre rayon de recherche pour découvrir plus de monde."
      actionLabel="Élargir mes critères"
      onAction={onOpenFilters}
    />
  );
}
