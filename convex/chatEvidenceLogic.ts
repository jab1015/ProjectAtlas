const URL_PATTERN = /https?:\/\/[^\s<>()\[\]{}"']+/gi;
const PATENT_PATTERN = /\b(?:US|WO|EP|CN|JP|KR|CA|AU)\s*\d{6,}[A-Z]?\d?\b/i;
const QUESTION_OPENING_PATTERN = /^(?:what|why|when|where|who|which|how|is|are|am|was|were|do|does|did|can|could|would|should|will|has|have|had|may|might)\b/i;
const ASSERTED_EVIDENCE_PATTERN = /\b(?:i|we)\s+(?:found|tested|measured|learned|confirmed|received|uploaded|surveyed|interviewed)|\b(?:prototype\s+test\s+(?:failed|passed|showed|found)|test\s+(?:result|data)\s+(?:show|was|is)|manufacturer\s+quote\s+(?:was|is|came)|factory\s+quote\s+(?:was|is|came)|quote\s+(?:was|is|came)|customer\s+(?:said|feedback)|sales\s+(?:data|results)|conversion\s+rate\s+(?:was|is)|cost\s+(?:was|is|came)|professional\s+(?:said|report)|attorney\s+(?:said|advised)|engineer\s+(?:said|advised))\b/i;
const EXPLICIT_EVIDENCE_ACTION_PATTERN = /\b(?:use|mark|record|note|save|add)\s+(?:this|these)\b/i;
const MATERIAL_TOPIC_PATTERN = /\b(?:survey(?:monkey)?|interview(?:ed|s)?|prototype\s+(?:test|result|failed|passed)|test\s+(?:result|data)|manufacturer\s+(?:quote|response)|factory\s+(?:quote|response)|quote\s+(?:is|was|came)|patent\s+(?:status|reference|number)|abandoned|expired|maintenance\s+fee|prior\s+art|customer\s+(?:said|feedback)|sales\s+(?:data|results)|conversion\s+rate|cost\s+(?:is|was|came)|professional\s+(?:said|report)|attorney\s+(?:said|advised)|engineer\s+(?:said|advised))\b/i;

export function extractChatEvidenceUrls(content: string) {
  return [...new Set(content.match(URL_PATTERN) ?? [])].slice(0, 12);
}

export function shouldCaptureChatAsInventorEvidence(content: string) {
  const text = content.trim();
  if (!text) return false;
  // A question about a patent, survey or other research topic is a chat turn,
  // not evidence. Keep factual statements and explicit evidence-submission
  // instructions, including a factual statement followed by a question.
  const assertsEvidence = ASSERTED_EVIDENCE_PATTERN.test(text) || EXPLICIT_EVIDENCE_ACTION_PATTERN.test(text);
  if ((text.includes("?") || QUESTION_OPENING_PATTERN.test(text)) && !assertsEvidence) return false;
  return assertsEvidence || extractChatEvidenceUrls(text).length > 0 || PATENT_PATTERN.test(text) || MATERIAL_TOPIC_PATTERN.test(text);
}

export function isInventorEvidenceSource(metadata: { provenance?: string; capturedFrom?: string } | null | undefined, excerpt?: string | null) {
  if (metadata?.provenance !== "inventor_upload") return false;
  if (metadata.capturedFrom !== "ask_inventsmith") return true;
  return shouldCaptureChatAsInventorEvidence(excerpt ?? "");
}

export function chatEvidenceKind(content: string) {
  if (/patent|prior\s+art|\b(?:US|WO|EP|CN|JP|KR|CA|AU)\s*\d{6,}/i.test(content)) return "prior_art";
  if (/survey|interview|customer\s+(?:said|feedback)/i.test(content)) return "customer_discovery";
  if (/prototype|test\s+(?:result|data)|measured/i.test(content)) return "prototype_test";
  if (/manufacturer|factory|quote|rfq/i.test(content)) return "manufacturer_quote";
  if (/attorney|engineer|professional\s+(?:said|report)/i.test(content)) return "professional_report";
  if (/sales|conversion\s+rate/i.test(content)) return "sales_evidence";
  return "chat_input";
}
