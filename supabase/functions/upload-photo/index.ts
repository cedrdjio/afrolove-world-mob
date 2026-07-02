// Uploads a profile photo to Storage via the S3 protocol instead of the
// JWT/RLS-authenticated Storage REST API. The client-side path (supabase-js
// storage.upload()) has intermittently failed with "new row violates
// row-level security policy" even with a confirmed-valid session and
// verified-correct RLS policies — the wire request evidently doesn't
// always carry the token supabase-js believes it attached. Routing the
// object write through this function sidesteps that entirely: the S3
// credentials that authorize the write never leave the server, and the
// caller only needs a valid Supabase session to reach this function at
// all (verify_jwt is enabled, so unauthenticated calls are rejected before
// this code runs).
//
// Required secrets (set with `supabase secrets set`, never in client code):
//   S3_ACCESS_KEY_ID
//   S3_SECRET_ACCESS_KEY
// SUPABASE_URL / SUPABASE_ANON_KEY are auto-injected by the platform.

import { createClient } from 'npm:@supabase/supabase-js@2.110.0';
import { AwsClient } from 'npm:aws4fetch@1.0.20';

const BUCKET = 'profile-photos';
const S3_REGION = 'eu-west-3';
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

function s3Endpoint(): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const host = new URL(supabaseUrl).host.replace('.supabase.co', '.storage.supabase.co');
  return `https://${host}/storage/v1/s3`;
}

// The browser sends a preflight OPTIONS before the POST (custom x-upload-*
// headers make the request non-simple), so every response — including errors —
// must carry CORS headers or web builds can never reach this function.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-upload-mode, x-upload-position, x-upload-photo-id',
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

  // Bound to the caller's own JWT so this respects profile_photos' RLS
  // (auth.uid() = profile_id) exactly like the client's normal calls do —
  // only the Storage object write itself needs the S3 bypass below.
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

  const mode = req.headers.get('x-upload-mode');
  const position = Number(req.headers.get('x-upload-position') ?? '0');
  const photoId = req.headers.get('x-upload-photo-id');

  if (mode !== 'add' && mode !== 'replace') {
    return jsonResponse({ error: 'invalid_mode' }, 400);
  }
  if (mode === 'replace' && !photoId) {
    return jsonResponse({ error: 'missing_photo_id' }, 400);
  }

  // Read the body directly rather than trusting a Content-Length header —
  // React Native's fetch doesn't reliably set one for binary bodies.
  const body = new Uint8Array(await req.arrayBuffer());
  if (body.byteLength === 0 || body.byteLength > MAX_UPLOAD_BYTES) {
    return jsonResponse({ error: 'invalid_body_size' }, 400);
  }

  // mode=replace: only the owner of the existing photo may overwrite it —
  // enforced here in code since the S3-signed write below bypasses RLS.
  let existingProfileId: string | null = null;
  if (mode === 'replace') {
    const { data: existing, error: fetchError } = await userClient
      .from('profile_photos')
      .select('profile_id')
      .eq('id', photoId)
      .single();
    if (fetchError || !existing) {
      return jsonResponse({ error: 'photo_not_found' }, 404);
    }
    if (existing.profile_id !== user.id) {
      return jsonResponse({ error: 'forbidden' }, 403);
    }
    existingProfileId = existing.profile_id;
  }

  const s3 = new AwsClient({
    accessKeyId: Deno.env.get('S3_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('S3_SECRET_ACCESS_KEY')!,
    region: S3_REGION,
    service: 's3',
  });

  const objectKey = `${user.id}/${Date.now()}.jpg`;
  const putResponse = await s3.fetch(`${s3Endpoint()}/${BUCKET}/${objectKey}`, {
    method: 'PUT',
    body,
    headers: { 'Content-Type': 'image/jpeg' },
  });

  if (!putResponse.ok) {
    const detail = await putResponse.text().catch(() => '');
    console.error('[upload-photo] S3 PUT failed', putResponse.status, detail);
    return jsonResponse({ error: 'upload_failed' }, 502);
  }

  const publicUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/${BUCKET}/${objectKey}`;

  if (mode === 'add') {
    const { data, error } = await userClient
      .from('profile_photos')
      .insert({ profile_id: user.id, url: publicUrl, position, is_primary: position === 0 })
      .select('id, url, position, is_primary')
      .single();
    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse(data);
  }

  const { data, error } = await userClient
    .from('profile_photos')
    .update({ url: publicUrl })
    .eq('id', photoId)
    .eq('profile_id', existingProfileId!)
    .select('id, url, position, is_primary')
    .single();
  if (error) return jsonResponse({ error: error.message }, 400);
  return jsonResponse(data);
});
