import { supabase } from '@/shared/services/supabase/client';

export interface BlockedProfile {
  id: string;
  firstName: string;
  avatarUrl: string | null;
  blockedAt: string;
}

async function submitReport(input: {
  reporterId: string;
  reportedId: string;
  reason: string;
  details: string | null;
}): Promise<void> {
  const { error } = await supabase.from('reports').insert({
    reporter_id: input.reporterId,
    reported_id: input.reportedId,
    reason: input.reason,
    details: input.details,
  });
  if (error) throw error;
}

/** Blocking hides both members from each other everywhere (discovery,
 *  search, conversations, messages) — enforced in the DB RPCs/policies. */
async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase
    .from('blocks')
    .upsert({ blocker_id: blockerId, blocked_id: blockedId }, { onConflict: 'blocker_id,blocked_id' });
  if (error) throw error;
}

async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
  if (error) throw error;
}

async function fetchBlockedProfiles(): Promise<BlockedProfile[]> {
  const { data, error } = await supabase.rpc('get_my_blocked_profiles');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.blocked_id,
    firstName: row.first_name ?? '',
    avatarUrl: row.avatar_url,
    blockedAt: row.blocked_at,
  }));
}

/** Unmatch = delete the match row; messages cascade away with it. */
async function unmatch(matchId: string): Promise<void> {
  const { error } = await supabase.from('matches').delete().eq('id', matchId);
  if (error) throw error;
}

export const moderationService = {
  submitReport,
  blockUser,
  unblockUser,
  fetchBlockedProfiles,
  unmatch,
};
