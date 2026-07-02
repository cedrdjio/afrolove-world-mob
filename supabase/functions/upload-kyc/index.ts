// Uploads one KYC document (id front/back or selfie) to the private
// kyc-documents bucket via the S3 protocol — same rationale as upload-photo:
// the S3 credentials that authorize the write never leave the server, and
// the caller only needs a valid session (verify_jwt is enabled). Files land
// under <user-id>/<part>-<timestamp>.jpg, which is what the storage RLS
// policy and the manual admin review expect. The kyc_submissions row itself
// is inserted by the client afterwards (its RLS only allows own+pending).
//
// Required secrets (shared with upload-photo):
//   S3_ACCESS_KEY_ID
//   S3_SECRET_ACCESS_KEY

import { createClient } from 'npm:@supabase/supabase-js@2.110.0';
import { AwsClient } from 'npm:aws4fetch@1.0.20';

const BUCKET = 'kyc-documents';
const S3_REGION = 'eu-west-3';
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const PARTS = ['front', 'back', 'selfie'] as const;

function s3Endpoint(): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const host = new URL(supabaseUrl).host.replace('.supabase.co', '.storage.supabase.co');
  return `https://${host}/storage/v1/s3`;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kyc-part',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'missing_authorization' }, 401);
  }

  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return jsonResponse({ error: 'invalid_session' }, 401);
  }

  const part = req.headers.get('x-kyc-part') as (typeof PARTS)[number] | null;
  if (!part || !PARTS.includes(part)) {
    return jsonResponse({ error: 'invalid_part' }, 400);
  }

  const body = new Uint8Array(await req.arrayBuffer());
  if (body.byteLength === 0 || body.byteLength > MAX_UPLOAD_BYTES) {
    return jsonResponse({ error: 'invalid_body_size' }, 400);
  }

  const s3 = new AwsClient({
    accessKeyId: Deno.env.get('S3_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('S3_SECRET_ACCESS_KEY')!,
    region: S3_REGION,
    service: 's3',
  });

  const objectPath = `${user.id}/${part}-${Date.now()}.jpg`;
  const putResponse = await s3.fetch(`${s3Endpoint()}/${BUCKET}/${objectPath}`, {
    method: 'PUT',
    body,
    headers: { 'Content-Type': 'image/jpeg' },
  });

  if (!putResponse.ok) {
    const detail = await putResponse.text().catch(() => '');
    console.error('[upload-kyc] S3 PUT failed', putResponse.status, detail);
    return jsonResponse({ error: 'upload_failed' }, 502);
  }

  return jsonResponse({ path: objectPath });
});
