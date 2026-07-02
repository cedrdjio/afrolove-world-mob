import { supabase } from '@/shared/services/supabase/client';

export type LegalDocumentKey = 'terms' | 'privacy';

export interface LegalDocument {
  key: LegalDocumentKey;
  title: string;
  content: string;
  version: number;
  updatedAt: string;
}

/**
 * Legal texts live in the `legal_documents` table (placeholder content for
 * now — the lawyer's final version will be pasted in, and the future NestJS
 * dashboard edits them without any app release). Readable by anon so the
 * register screen can show them before signup.
 */
async function fetchDocument(key: LegalDocumentKey): Promise<LegalDocument> {
  const { data, error } = await supabase
    .from('legal_documents')
    .select('key, title, content, version, updated_at')
    .eq('key', key)
    .single();
  if (error) throw error;

  return {
    key: data.key as LegalDocumentKey,
    title: data.title,
    content: data.content,
    version: data.version,
    updatedAt: data.updated_at,
  };
}

export const legalService = {
  fetchDocument,
};
