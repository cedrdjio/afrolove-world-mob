import { supabase } from '@/shared/services/supabase/client';
import type { InterestOption, ReferenceOption, RelationshipGoalOption } from '@/modules/profile/types/profile';

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

export const referenceDataService = {
  fetchInterests,
  fetchLanguages,
  fetchReligions,
  fetchEducationLevels,
  fetchRelationshipGoals,
};
