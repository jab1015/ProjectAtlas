export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const ACTION_PROMPTS: Record<string, string> = {
  profile: `Profile this document. Return ONLY a JSON object (no markdown fences) with keys:
"docType" (e.g. "Survey Results", "Pitch Deck", "Business Plan", "CAD File", "Manufacturing Quote", "Patent Draft", "Spreadsheet", "Image", "Archive", "Report", "Notes"),
"purpose" (one sentence),
"topics" (array of 3-6 short topic strings),
"relevance" (one sentence tying it to the invention),
"keyData" (array of up to 4 short strings of key facts/figures found or expected).`,
  summarize: 'Produce a concise executive summary of this document: what it is, key points, key numbers, and what it means for the invention. Use short sections with bold headers and bullets.',
  analyze: 'Perform a deep analysis of this document: structure, key data, strengths, weaknesses, gaps, and implications for the invention. End with a short "What Atlas Will Do Next" section.',
  risks: 'Identify all risks surfaced by or contained in this document (market, technical, legal/IP, financial, manufacturing). For each risk give severity (High/Medium/Low), why it matters, and a mitigation Atlas recommends.',
  improve: 'Suggest concrete improvements to this document: content gaps, weak arguments, outdated data, formatting/structure issues, and missing sections. Prioritize the top 5 improvements.',
  'update-research': 'Act as if updating this document with the newest research for this invention. Produce the UPDATED CONTENT sections: refreshed market statistics, competitor moves, cost estimates, and revised conclusions — written so they can slot into the existing document while preserving its structure, tone, branding and formatting. Clearly mark each updated section with the heading it replaces.',
  rewrite: 'Rewrite the core content of this document professionally: clearer, tighter, executive-grade language while preserving all facts, figures, structure and intent. Output the rewritten content.',
  expand: 'Expand this document: add depth, supporting evidence, examples, and missing sections while keeping the original voice and structure. Output the expanded content outline with new sections fully written.',
  shorten: 'Condense this document to roughly half its length, preserving all critical facts and figures. Output the shortened content.',
  'exec-summary': 'Create a one-page Executive Summary of this document suitable for investors or leadership: opening statement, 4-6 key bullets with numbers, and a closing recommendation.',
  'extract-data': 'Extract all structured data from this document: numbers, statistics, dates, prices, percentages, names, and tables. Present as clean markdown tables grouped by category.',
  'action-items': 'Generate a prioritized action item list from this document. For each: the action, owner (which Atlas department handles it autonomously vs. what needs human approval), and expected impact. Remember: only spending money, legal filings, public launches, licensing, physical prototype evaluation, or purpose-changing decisions need human approval.',
  survey: `This is a survey export (e.g. SurveyMonkey). Analyze it fully:
1. Response summary & statistics
2. Trends and segments
3. Top customer pain points
4. Purchase intent (estimate % and confidence)
5. Willingness to pay (ranges)
6. Feature demand ranking
7. Objections and concerns
8. How this changes project confidence and health
9. Which project documents Atlas will now update (market validation report, pitch deck, business plan) and exactly what changes.
Use markdown tables where useful. If raw data is limited, state assumptions clearly.`,
  compare: 'Compare the document versions provided. Produce: What Changed (section by section), Data Changes (old vs new values in a table), Improvements, Regressions or Losses, and a Verdict on which version is stronger.',
  ask: 'Answer the user question strictly using the document content and project context provided. If the document does not contain the answer, say what is missing and how Atlas can obtain it. Be concise and executive in tone.'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      action = 'summarize',
      document = {},
      content = '',
      question = '',
      projectName = 'the invention',
      projectStage = 'Idea',
      compareWith = ''
    } = body;

    const gatewayApiKey = Deno.env.get('GATEWAY_API_KEY');
    if (!gatewayApiKey) {
      return new Response(JSON.stringify({ error: 'API Gateway key not configured' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const instruction = ACTION_PROMPTS[action] || ACTION_PROMPTS.summarize;
    const truncated = String(content || '').slice(0, 24000);
    const truncatedCompare = String(compareWith || '').slice(0, 12000);

    const system = `You are Atlas Document Intelligence — the document brain of an autonomous AI invention company.
You understand document type, purpose, layout, branding, charts, tables, writing style, topics and key data.
When updating documents you PRESERVE original formatting, branding, slide layouts, fonts, colors and page structure — you edit, never recreate.
Executive tone: analyze, decide, execute, document, report. Never ask permission except for spending money, legal filings, public launches, licensing, physical evaluation, or purpose-changing decisions.
Current project: "${projectName}" (lifecycle stage: ${projectStage}). Everything you produce serves this invention.
Format responses in clean markdown with bold headers and bullets. No preamble.`;

    let userMsg = `DOCUMENT METADATA:
Name: ${document.name || 'Untitled'}
File type: ${document.ext || 'unknown'}
Folder: ${document.folder || 'General'}
Size: ${document.size ? Math.round(document.size / 1024) + ' KB' : 'unknown'}
${document.docType ? 'Known type: ' + document.docType : ''}

${truncated ? 'EXTRACTED DOCUMENT CONTENT:\n' + truncated : 'NOTE: Binary file — full text not extractable in-browser. Reason from the metadata, file type conventions and project context; be explicit about assumptions.'}
${truncatedCompare ? '\n\nPREVIOUS VERSION CONTENT (for comparison):\n' + truncatedCompare : ''}
${question ? '\n\nUSER QUESTION: ' + question : ''}

TASK: ${instruction}`;

    const response = await fetch('https://ai.gateway.fastrouter.io/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': gatewayApiKey },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userMsg }
        ],
        temperature: 0.4
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gateway error:', errText);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const data = await response.json();
    let result = data.choices?.[0]?.message?.content || '';

    if (action === 'profile') {
      // Attempt to parse JSON profile; strip fences if present
      let profile: unknown = null;
      try {
        const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) profile = JSON.parse(cleaned.slice(start, end + 1));
      } catch (_e) { /* fall through */ }
      return new Response(JSON.stringify({ profile: profile || { docType: 'Document', purpose: 'Uploaded project document', topics: [], relevance: '', keyData: [] } }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ result }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
