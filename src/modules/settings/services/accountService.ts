import { supabase } from '@/shared/services/supabase/client';

/**
 * Account "deletion" is a soft delete by design: the row survives with
 * account_status = 'deleted' so a returning banned user is always
 * recognized (the guard trigger lets a user self-delete and reactivate,
 * but never touch a 'banned' status — that transition is admin-only).
 * The profile immediately disappears from discovery, conversations and
 * public views, all of which filter on account_status = 'active'.
 */
async function deactivateAccount(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ account_status: 'deleted' })
    .eq('id', userId);
  if (error) throw error;
}

/** A self-deleted (not banned) account can come back with everything intact. */
async function reactivateAccount(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ account_status: 'active' })
    .eq('id', userId);
  if (error) throw error;
}

export const accountService = {
  deactivateAccount,
  reactivateAccount,
};
