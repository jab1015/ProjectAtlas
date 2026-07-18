import { createClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const ACCOUNTS = [
  { email: 'admin@projectatlas.ai', password: 'AtlasAdmin2026!', name: 'Atlas Admin', role: 'admin', plan: 'enterprise', credits: 9999 },
  { email: 'tester@projectatlas.ai', password: 'AtlasTester2026!', name: 'Atlas Tester', role: 'tester', plan: 'enterprise', credits: 1000 },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results: Record<string, string>[] = [];

    for (const acct of ACCOUNTS) {
      let userId: string | null = null;

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: acct.email,
        password: acct.password,
        email_confirm: true,
        user_metadata: { name: acct.name },
      });

      if (createErr) {
        // Probably already exists — find the user and reset the password
        const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
        const existing = list?.users?.find((u) => u.email === acct.email);
        if (existing) {
          userId = existing.id;
          await admin.auth.admin.updateUserById(userId, {
            password: acct.password,
            email_confirm: true,
            user_metadata: { name: acct.name },
          });
        } else {
          results.push({ email: acct.email, status: 'error: ' + createErr.message });
          continue;
        }
      } else {
        userId = created.user.id;
      }

      // Upsert configured profile
      const { error: profErr } = await admin.from('profiles').upsert({
        id: userId,
        email: acct.email,
        name: acct.name,
        plan: acct.plan,
        credits: acct.credits,
        role: acct.role,
      });

      results.push({ email: acct.email, status: profErr ? 'profile error: ' + profErr.message : 'ok', id: userId! });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});