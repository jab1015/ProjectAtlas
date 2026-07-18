export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const svc = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  return new Response(JSON.stringify({
    url,
    svcLen: svc.length,
    svcPrefix: svc.slice(0, 12),
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});