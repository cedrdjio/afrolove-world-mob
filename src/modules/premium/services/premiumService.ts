import { supabase } from '@/shared/services/supabase/client';
import { paymentService } from '@/modules/premium/payments';
import type { PaymentResult } from '@/modules/premium/payments';

export interface PremiumPlan {
  key: string;
  label: string;
  description: string | null;
  priceCents: number;
  currency: string;
  durationDays: number;
  sortOrder: number;
}

export interface Entitlements {
  isPremium: boolean;
  premiumUntil: string | null;
  planLabel: string | null;
  likesUsedToday: number;
  /** null = illimité */
  likesLimit: number | null;
  superLikesUsedToday: number;
  superLikesLimit: number;
  likersCount: number;
  swipesUsedToday: number;
  /** null = illimité (premium) */
  swipesLimit: number | null;
  favoritesCount: number;
  /** null = illimité (premium) */
  favoritesLimit: number | null;
}

export interface LikerProfile {
  id: string;
  firstName: string;
  avatarUrl: string | null;
  city: string | null;
  isVerified: boolean;
  action: 'like' | 'super_like';
  likedAt: string;
}

/** Favori = profil sauvegardé via le bouton favori (premium only), pas un like. */
export interface FavoriteProfile {
  id: string;
  firstName: string;
  avatarUrl: string | null;
  city: string | null;
  isVerified: boolean;
  savedAt: string;
}

async function fetchPlans(): Promise<PremiumPlan[]> {
  const { data, error } = await supabase
    .from('premium_plans')
    .select('key, label, description, price_cents, currency, duration_days, sort_order')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    key: row.key,
    label: row.label,
    description: row.description,
    priceCents: row.price_cents,
    currency: row.currency,
    durationDays: row.duration_days,
    sortOrder: row.sort_order,
  }));
}

async function fetchEntitlements(): Promise<Entitlements> {
  const { data, error } = await supabase.rpc('get_my_entitlements');
  if (error) throw error;
  const row = data?.[0];
  return {
    isPremium: row?.is_premium ?? false,
    premiumUntil: row?.premium_until ?? null,
    planLabel: row?.plan_label ?? null,
    likesUsedToday: row?.likes_used_today ?? 0,
    likesLimit: row?.likes_limit ?? null,
    superLikesUsedToday: row?.super_likes_used_today ?? 0,
    superLikesLimit: row?.super_likes_limit ?? 0,
    likersCount: row?.likers_count ?? 0,
    swipesUsedToday: row?.swipes_used_today ?? 0,
    swipesLimit: row?.swipes_limit ?? null,
    favoritesCount: row?.favorites_count ?? 0,
    favoritesLimit: row?.favorites_limit ?? null,
  };
}

/**
 * Real purchase: opens the active payment provider's checkout (CamerPay today)
 * and resolves with a normalized outcome. Premium itself is granted server-side
 * by the provider webhook, which calls the same grant_subscription() core the
 * dev stub used — stacking, expiry, limits and gating are unchanged. The caller
 * routes on `outcome`; entitlements are re-fetched on 'succeeded'.
 */
async function purchasePlan(input: {
  planKey: string;
  phone: string;
  paymentMethod?: string;
}): Promise<PaymentResult> {
  return paymentService.checkout(input);
}

/** Profils sauvegardés en favori (vide pour les non-premium : ils ne peuvent
 *  rien enregistrer, la garde premium est dans add_favorite). */
async function fetchFavorites(): Promise<FavoriteProfile[]> {
  const { data, error } = await supabase.rpc('get_saved_favorites');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.profile_id,
    firstName: row.first_name ?? '',
    avatarUrl: row.avatar_url,
    city: row.city,
    isVerified: row.is_verified,
    savedAt: row.saved_at,
  }));
}

/** Ids des profils déjà en favori — pour l'état du bouton dans Discover. */
async function fetchFavoriteIds(): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_my_favorite_ids');
  if (error) throw error;
  return (data ?? []).map((row) => row.target_id);
}

/** Premium only : la RPC lève PREMIUM_REQUIRED pour les non-abonnés. */
async function addFavorite(targetId: string): Promise<void> {
  const { error } = await supabase.rpc('add_favorite', { p_target_id: targetId });
  if (error) throw error;
}

async function removeFavorite(targetId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_favorite', { p_target_id: targetId });
  if (error) throw error;
}

/** Empty for non-premium accounts (enforced in the RPC itself). */
async function fetchLikers(): Promise<LikerProfile[]> {
  const { data, error } = await supabase.rpc('get_my_likers');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.profile_id,
    firstName: row.first_name ?? '',
    avatarUrl: row.avatar_url,
    city: row.city,
    isVerified: row.is_verified,
    action: row.action as 'like' | 'super_like',
    likedAt: row.liked_at,
  }));
}

export const premiumService = {
  fetchPlans,
  fetchEntitlements,
  purchasePlan,
  fetchFavorites,
  fetchFavoriteIds,
  addFavorite,
  removeFavorite,
  fetchLikers,
};
