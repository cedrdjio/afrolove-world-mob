import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moderationService } from '@/modules/reports/services/moderationService';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { CONVERSATIONS_QUERY_KEY } from '@/modules/messaging/hooks/useMessaging';

export const BLOCKED_PROFILES_QUERY_KEY = 'blocked-profiles' as const;

export function useSubmitReport() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ reportedId, reason, details }: { reportedId: string; reason: string; details: string | null }) => {
      if (!user) throw new Error('Session invalide');
      return moderationService.submitReport({ reporterId: user.id, reportedId, reason, details });
    },
  });
}

export function useBlockedProfiles() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [BLOCKED_PROFILES_QUERY_KEY],
    queryFn: moderationService.fetchBlockedProfiles,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

function useInvalidateAfterBlockChange() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [BLOCKED_PROFILES_QUERY_KEY] });
    // Blocked members vanish from conversations and the deck server-side.
    queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: ['discovery'] });
  };
}

export function useBlockUser() {
  const { user } = useAuth();
  const invalidate = useInvalidateAfterBlockChange();

  return useMutation({
    mutationFn: (blockedId: string) => {
      if (!user) throw new Error('Session invalide');
      return moderationService.blockUser(user.id, blockedId);
    },
    onSuccess: invalidate,
  });
}

export function useUnblockUser() {
  const { user } = useAuth();
  const invalidate = useInvalidateAfterBlockChange();

  return useMutation({
    mutationFn: (blockedId: string) => {
      if (!user) throw new Error('Session invalide');
      return moderationService.unblockUser(user.id, blockedId);
    },
    onSuccess: invalidate,
  });
}

export function useUnmatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) => moderationService.unmatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
