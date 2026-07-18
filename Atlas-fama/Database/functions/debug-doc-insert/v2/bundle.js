export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const URL_BASE = 'https://dgjqtdkfixmhyzthpbgp.databasepad.com';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImExYzNlYWE3LTZiOTktNDM3Zi05YWUyLWNkZGI0ZmFmNjkzNyJ9.eyJwcm9qZWN0SWQiOiJkZ2pxdGRrZml4bWh5enRocGJncCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg0MjUyOTQxLCJleHAiOjIwOTk2MTI5NDEsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.0HUXH6BQCVroMKL9ZkvPAVezKq2wrEMg6W9aqyhjchQ';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const now = new Date().toISOString();
  const versions = [{ version: '1.0', createdAt: now, note: 'debug', storagePath: null, size: 10 }];
  const row = {
    owner_key: 'debug-test',
    project_id: 'debug-project',
    name: 'debug.txt',
    folder: 'General',
    ext: 'txt',
    size: 10,
    storage_path: null,
    archived: false,
    deleted: false,
    current_version: '1.0',
    versions: JSON.stringify(versions),
    ai_meta: {},
    created_at: now,
    updated_at: now,
  };
  const results: Record<string, unknown> = {};

  // 1) Insert with stringified versions
  const insRes = await fetch(`${URL_BASE}/rest/v1/project_documents`, {
    method: 'POST',
    headers: {
      'apikey': ANON,
      'Authorization': `Bearer ${ANON}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(row)
  });
  results.insertStatus = insRes.status;
  results.insertBody = (await insRes.text()).slice(0, 1200);

  // 2) Update with stringified versions (patch path)
  const updRes = await fetch(`${URL_BASE}/rest/v1/project_documents?owner_key=eq.debug-test`, {
    method: 'PATCH',
    headers: {
      'apikey': ANON,
      'Authorization': `Bearer ${ANON}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ versions: JSON.stringify([...versions, { version: '1.1', createdAt: now, note: 'debug2' }]) })
  });
  results.updateStatus = updRes.status;
  results.updateBody = (await updRes.text()).slice(0, 1200);

  return new Response(JSON.stringify(results, null, 2), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});
