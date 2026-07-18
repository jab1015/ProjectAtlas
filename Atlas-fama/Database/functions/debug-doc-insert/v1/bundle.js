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
    versions: [{ version: '1.0', createdAt: now, note: 'debug', storagePath: null, size: 10 }],
    ai_meta: {},
    created_at: now,
    updated_at: now,
  };
  const results: Record<string, unknown> = {};

  // 1) Insert via REST like the frontend
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
  results.insertBody = (await insRes.text()).slice(0, 800);

  // 2) Select via REST
  const selRes = await fetch(`${URL_BASE}/rest/v1/project_documents?select=*&owner_key=eq.debug-test`, {
    headers: { 'apikey': ANON, 'Authorization': `Bearer ${ANON}` }
  });
  results.selectStatus = selRes.status;
  results.selectBody = (await selRes.text()).slice(0, 800);

  // 3) Storage upload test
  const upRes = await fetch(`${URL_BASE}/storage/v1/object/project-docs/debug-test/debug.txt`, {
    method: 'POST',
    headers: { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'text/plain' },
    body: 'debug data'
  });
  results.storageStatus = upRes.status;
  results.storageBody = (await upRes.text()).slice(0, 800);

  return new Response(JSON.stringify(results, null, 2), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});
