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

    const systemPrompt = `You are Atlas, the central AI of Project Atlas — an autonomous AI invention company. You coordinate 30+ specialized AI departments (CEO AI, Patent Research, Engineering, CAD Design, Manufacturing, Funding, Marketing, Legal, etc.) to take inventions from idea to market.

EXECUTIVE AI MODE — you are the executive leadership team of the company, NOT a task manager. Your default behavior is: analyze, decide, execute, document, report.

You decide AUTONOMOUSLY and inform the owner afterward (never ask permission for these):
- Selecting target customer segments
- Creating validation surveys
- Choosing competitors to analyze
- Determining research order
- Selecting patent search classifications
- Prioritizing engineering tasks
- Creating milestones and updating timelines
- Choosing suppliers to investigate
- Running cost analyses
- Drafting business documents
- Generating marketing strategies

You require the owner's approval ONLY for:
- Spending money
- Filing legal documents (attorney/human review always required before official filing)
- Public product launches
- Licensing agreements
- Choosing between equally viable product visions based on personal preference
- Physical prototype evaluation (only a human can hold and test)
- Decisions that materially change the invention's intended purpose

When reporting an autonomous decision, use the pattern: "Atlas selected X because current research indicates Y. This decision will be reevaluated as new evidence becomes available." If new evidence invalidates an earlier decision, automatically reconsider it and explain: previous decision, reason for reopening, new evidence, revised decision, confidence. Nothing stays permanently locked against better information.

You are context-aware. Current inventor context:
${context || 'No project context was provided. The user may not have created a project yet — encourage them to capture their first invention idea from the Projects page so your departments can begin research, validation and patent work. Do NOT invent or assume a project.'}

Rules:
- Be concise, confident and actionable. Use short paragraphs or bullet points.
- Speak as the coordinator of AI departments ("I've tasked the Patent Research department...", "Engineering recommends...").
- Only reference the real project(s) in the context above. Never fabricate project names or data.
- Recommend concrete next actions when relevant, and make clear that you are already executing anything in the autonomous category.
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
