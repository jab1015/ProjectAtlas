export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const VERSION = 'v1-direct-rest';
const FALLBACK_URL = 'https://dgjqtdkfixmhyzthpbgp.databasepad.com';

const ACCOUNTS = [
  { email: 'admin@projectatlas.ai', password: 'AtlasAdmin2026!', name: 'Atlas Admin', role: 'admin', plan: 'enterprise', credits: 9999 },
  { email: 'tester@projectatlas.ai', password: 'AtlasTester2026!', name: 'Atlas Tester', role: 'tester', plan: 'enterprise', credits: 1000 },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let baseUrl = (Deno.env.get('SUPABASE_URL') || '').trim();
    if (!baseUrl || !baseUrl.startsWith('http')) baseUrl = FALLBACK_URL;
    baseUrl = baseUrl.replace(/\/+$/, '');

    const svcKey = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').trim();
    if (!svcKey) {
      return new Response(JSON.stringify({ version: VERSION, error: 'Missing service role key' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const authHeaders = {
      'apikey': svcKey,
      'Authorization': `Bearer ${svcKey}`,
      'Content-Type': 'application/json'
    };

    const results: Record<string, unknown>[] = [];

    for (const acct of ACCOUNTS) {
      let userId: string | null = null;
      const steps: string[] = [];

      // 1. Try to create user via admin API
      const createRes = await fetch(`${baseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          email: acct.email,
          password: acct.password,
          email_confirm: true,
          user_metadata: { name: acct.name }
        })
      });

      const createBody = await createRes.json().catch(() => ({}));

      if (createRes.ok && (createBody.id || createBody.user?.id)) {
        userId = createBody.id || createBody.user?.id;
        steps.push('created');
      } else {
        steps.push(`create failed (${createRes.status}): ${JSON.stringify(createBody).slice(0, 200)}`);

        // 2. User probably exists — find them
        const listRes = await fetch(`${baseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
          method: 'GET',
          headers: authHeaders
        });
        const listBody = await listRes.json().catch(() => ({}));
        const users = listBody.users || (Array.isArray(listBody) ? listBody : []);
        const existing = users.find((u: { email?: string }) => (u.email || '').toLowerCase() === acct.email.toLowerCase());

        if (existing?.id) {
          userId = existing.id;
          steps.push('found existing');

          // 3. Reset password + confirm email
          const updRes = await fetch(`${baseUrl}/auth/v1/admin/users/${userId}`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({
              password: acct.password,
              email_confirm: true,
              user_metadata: { name: acct.name }
            })
          });
          const updBody = await updRes.json().catch(() => ({}));
          steps.push(updRes.ok ? 'password reset' : `update failed (${updRes.status}): ${JSON.stringify(updBody).slice(0, 200)}`);
        } else {
          steps.push(`list users returned ${listRes.status}, could not find account`);
          results.push({ email: acct.email, status: 'error', steps });
          continue;
        }
      }

      // 4. Upsert profile row via PostgREST
      const profRes = await fetch(`${baseUrl}/rest/v1/profiles?on_conflict=id`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify({
          id: userId,
          email: acct.email,
          name: acct.name,
          plan: acct.plan,
          credits: acct.credits,
          role: acct.role
        })
      });
      const profBody = await profRes.text();
      steps.push(profRes.ok ? 'profile upserted' : `profile failed (${profRes.status}): ${profBody.slice(0, 200)}`);

      results.push({ email: acct.email, id: userId, status: profRes.ok ? 'ok' : 'partial', steps });
    }

    return new Response(JSON.stringify({ version: VERSION, baseUrl, results }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ version: VERSION, error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
