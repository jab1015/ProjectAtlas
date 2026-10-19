/** Return an inventor-safe explanation without exposing raw provider errors. */
export function safeWorkFailureSummary(rawError?: string): string {
  const message = rawError ?? "";
  if (/\b401\b|incorrect api key|invalid api key|unauthorized/i.test(message)) {
    return "The AI provider rejected its configured credentials. An administrator must check this environment’s provider settings.";
  }
  if (/insufficient_quota|billing hard limit|quota exceeded/i.test(message)) {
    return "The AI provider reported that its account quota is unavailable. An administrator must check provider billing or limits.";
  }
  if (/\b429\b|rate.?limit|too many requests/i.test(message)) {
    return "The AI provider is temporarily rate limited. Try again later.";
  }
  if (/OPENAI_API_KEY.*not set|api key.*not configured/i.test(message)) {
    return "The AI provider is not configured for this environment. An administrator must check its settings.";
  }
  return "This work item failed after its available attempts. Check InventSmith Operations for the environment status before retrying.";
}
