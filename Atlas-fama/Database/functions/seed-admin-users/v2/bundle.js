export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const keys = Object.keys(Deno.env.toObject());
  return new Response(JSON.stringify({ keys }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});