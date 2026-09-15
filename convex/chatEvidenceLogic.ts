const URL_PATTERN = /https?:\/\/[^\s<>()\[\]{}"']+/gi;
const PATENT_PATTERN = /\b(?:US|WO|EP|CN|JP|KR|CA|AU)\s*\d{6,}[A-Z]?\d?\b/i;
const MATERIAL_INPUT_PATTERN = /\b(?:use\s+(?:this|these)|mark\b|record\b|note\b|i\s+(?:found|tested|measured|learned|confirmed|received|uploaded|surveyed)|survey(?:monkey)?|interview(?:ed|s)?|prototype\s+(?:test|result|failed|passed)|test\s+(?:result|data)|manufacturer\s+(?:quote|response)|factory\s+(?:quote|response)|quote\s+(?:is|was|came)|patent\s+(?:status|reference|number)|abandoned|expired|maintenance\s+fee|prior\s+art|customer\s+(?:said|feedback)|sales\s+(?:data|results)|conversion\s+rate|cost\s+(?:is|was|came)|professional\s+(?:said|report)|attorney\s+(?:said|advised)|engineer\s+(?:said|advised))\b/i;

export function extractChatEvidenceUrls(content: string) {
  return [...new Set(content.match(URL_PATTERN) ?? [])].slice(0, 12);
}

export function shouldCaptureChatAsInventorEvidence(content: string) {
  const text = content.trim();
  if (!text) return false;
  return extractChatEvidenceUrls(text).length > 0 || PATENT_PATTERN.test(text) || MATERIAL_INPUT_PATTERN.test(text);
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
