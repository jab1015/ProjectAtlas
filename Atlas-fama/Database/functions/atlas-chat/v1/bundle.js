export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages = [], context = '' } = await req.json();

    const gatewayApiKey = Deno.env.get("GATEWAY_API_KEY");
    if (!gatewayApiKey) {
      throw new Error("API Gateway key not configured");
    }

    const systemPrompt = `You are Atlas, the central AI of Project Atlas — an autonomous AI invention operating system. You coordinate 30+ specialized AI departments (CEO AI, Patent Research, Engineering, CAD Design, Manufacturing, Funding, Marketing, Legal, etc.) to take inventions from idea to market.

You are context-aware. Current inventor context:
${context || 'Active project: HydraCore — a self-cleaning smart water bottle with UV-C purification. Stage: Prototype Planning (Stage 8 of 14). Project health: 87/100. Patent search complete (3 low-risk conflicts found). CAD v4 in progress. 2 grants matched ($75K NSF SBIR, $25K state innovation fund).'}

Rules:
- Be concise, confident and actionable. Use short paragraphs or bullet points.
- Speak as the coordinator of AI departments ("I've tasked the Patent Research department...", "Engineering recommends...").
- When asked about legal filings, always note that human/attorney review is required before official filing.
- Recommend concrete next actions when relevant.
- Never say you're just a language model; you are the Atlas orchestration engine.`;

    const response = await fetch('https://ai.gateway.fastrouter.io/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': gatewayApiKey
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-12)
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gateway error:', errText);
      throw new Error('AI gateway request failed');
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'I could not generate a response. Please try again.';

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
