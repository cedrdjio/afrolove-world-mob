import { supabase } from '@/shared/services/supabase/client';
import type { InterestOption, ReferenceOption, RelationshipGoalOption } from '@/modules/profile/types/profile';

export interface LifestyleOptionRow {
  id: string;
  key: string;
  label: string;
  /** smoking | drinking | gym | pets | children */
  category: string;
  /** Valeur canonique stockée dans profiles (non_smoker, socially, …). */
  value: string;
  sortOrder: number;
}

async function fetchInterests(): Promise<InterestOption[]> {
  const { data, error } = await supabase.from('interests').select('id, key, label, icon, sort_order').order('sort_order');
  if (error) throw error;
  return data.map((row) => ({ id: row.id, key: row.key, label: row.label, icon: row.icon, sortOrder: row.sort_order }));
}

async function fetchLanguages(): Promise<ReferenceOption[]> {
  const { data, error } = await supabase.from('languages').select('id, key, label, sort_order').order('sort_order');
  if (error) throw error;
  return data.map((row) => ({ id: row.id, key: row.key, label: row.label, sortOrder: row.sort_order }));
}

async function fetchReligions(): Promise<ReferenceOption[]> {
  const { data, error } = await supabase.from('religions').select('id, key, label, sort_order').order('sort_order');
  if (error) throw error;
  return data.map((row) => ({ id: row.id, key: row.key, label: row.label, sortOrder: row.sort_order }));
}

async function fetchEducationLevels(): Promise<ReferenceOption[]> {
  const { data, error } = await supabase
    .from('education_levels')
    .select('id, key, label, sort_order')
    .order('sort_order');
  if (error) throw error;
  return data.map((row) => ({ id: row.id, key: row.key, label: row.label, sortOrder: row.sort_order }));
}

async function fetchRelationshipGoals(): Promise<RelationshipGoalOption[]> {
  const { data, error } = await supabase
    .from('relationship_goals')
    .select('id, key, label, subtitle, sort_order')
    .order('sort_order');
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    key: row.key,
    label: row.label,
    subtitle: row.subtitle,
    sortOrder: row.sort_order,
  }));
}

async function fetchLifestyleOptions(): Promise<LifestyleOptionRow[]> {
  const { data, error } = await supabase
    .from('lifestyle_options')
    .select('id, key, label, category, value, sort_order')
    .eq('is_active', true)
    .not('value', 'is', null)
    .order('sort_order');
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    key: row.key,
    label: row.label,
    category: row.category,
    value: row.value as string,
    sortOrder: row.sort_order,
  }));
}

export const referenceDataService = {
  fetchInterests,
  fetchLifestyleOptions,
  fetchLanguages,
  fetchReligions,
  fetchEducationLevels,
  fetchRelationshipGoals,
};
