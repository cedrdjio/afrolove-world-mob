import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '@/shared/services/supabase/client';
import type { KycDocType } from '@/modules/kyc/stores/kycStore';

const UPLOAD_KYC_FUNCTION = 'upload-kyc';
const MAX_DIMENSION = 1600; // documents need more detail than profile photos
const COMPRESSION_QUALITY = 0.8;

export type KycStatus = 'pending' | 'approved' | 'rejected';

export interface KycSubmission {
  id: string;
  docType: KycDocType;
  status: KycStatus;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export interface SubmitKycInput {
  profileId: string;
  docType: KycDocType;
  frontUri: string;
  backUri: string | null;
  selfieUri: string;
}

async function compress(uri: string): Promise<string> {
  const image = await ImageManipulator.manipulate(uri).resize({ width: MAX_DIMENSION }).renderAsync();
  const result = await image.saveAsync({ compress: COMPRESSION_QUALITY, format: SaveFormat.JPEG });
  return result.uri;
}

// Same explicit-Authorization pattern as photoService: functions.invoke()'s
// implicit token attachment has been unreliable, so never depend on it.
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) {
    throw new Error('Session invalide : merci de vous reconnecter avant de continuer.');
  }
  return { Authorization: `Bearer ${data.session.access_token}` };
}

async function uploadPart(localUri: string, part: 'front' | 'back' | 'selfie'): Promise<string> {
  const compressedUri = await compress(localUri);
  const arrayBuffer = await fetch(compressedUri).then((res) => res.arrayBuffer());
  const authHeaders = await getAuthHeaders();

  const { data, error } = await supabase.functions.invoke(UPLOAD_KYC_FUNCTION, {
    headers: { ...authHeaders, 'x-kyc-part': part },
    body: arrayBuffer,
  });
  if (error) throw error;
  return data.path as string;
}

/**
 * Uploads the captured documents to the private kyc-documents bucket, then
 * opens the submission row that the admin reviews manually in Supabase
 * (setting status to approved/rejected — a DB trigger then flips
 * profiles.is_verified and stamps reviewed_at).
 */
async function submit(input: SubmitKycInput, onProgress?: (percent: number) => void): Promise<void> {
  onProgress?.(5);
  const frontPath = await uploadPart(input.frontUri, 'front');
  onProgress?.(35);
  const backPath = input.backUri ? await uploadPart(input.backUri, 'back') : null;
  onProgress?.(65);
  const selfiePath = await uploadPart(input.selfieUri, 'selfie');
  onProgress?.(90);

  const { error } = await supabase.from('kyc_submissions').insert({
    profile_id: input.profileId,
    doc_type: input.docType,
    id_front_path: frontPath,
    id_back_path: backPath,
    selfie_path: selfiePath,
  });
  if (error) throw error;
  onProgress?.(100);
}

async function fetchLatestSubmission(profileId: string): Promise<KycSubmission | null> {
  const { data, error } = await supabase
    .from('kyc_submissions')
    .select('id, doc_type, status, rejection_reason, submitted_at, reviewed_at')
    .eq('profile_id', profileId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    docType: data.doc_type as KycDocType,
    status: data.status as KycStatus,
    rejectionReason: data.rejection_reason,
    submittedAt: data.submitted_at,
    reviewedAt: data.reviewed_at,
  };
}

export const kycService = {
  submit,
  fetchLatestSubmission,
};
