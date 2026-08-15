export const CHAT_MESSAGE_MAX_CHARACTERS = 4000;
export const CHAT_QUESTIONS_PER_MINUTE = 5;
export const CHAT_MODEL_CONTEXT_MAX_CHARACTERS = 120_000;

export function truncateModelContext(value: unknown, maxCharacters: number): string {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? null);
  if (text.length <= maxCharacters) return text;
  const marker = "\n[Context truncated by InventSmith]";
  return `${text.slice(0, Math.max(0, maxCharacters - marker.length))}${marker}`;
}

export function isValidChatContent(content: string): boolean {
  const length = content.trim().length;
  return length > 0 && length <= CHAT_MESSAGE_MAX_CHARACTERS;
}

export function canAskChatQuestion(
  recentUserQuestionTimes: number[],
  now: number
): boolean {
  const windowStart = now - 60_000;
  return recentUserQuestionTimes.filter((createdAt) => createdAt >= windowStart && createdAt <= now).length < CHAT_QUESTIONS_PER_MINUTE;
}

/**
 * Questions about mutable outside-world facts should be checked against live
 * sources instead of answered only from the invention record. This is
 * deliberately conservative for patent/legal/regulatory status and explicit
 * URLs because stale status can materially change an inventor's next move.
 */
export function shouldUseExternalResearch(question: string): boolean {
  const normalized = question.toLowerCase();
  if (/https?:\/\//.test(normalized)) return true;
  return [
    "patent status",
    "abandoned",
    "expired",
    "fee related",
    "maintenance fee",
    "patents.google",
    "google patents",
    "uspto",
    "trademark status",
    "regulatory status",
    "recall",
    "current price",
    "current manufacturer",
    "currently available",
    "latest",
    "today",
  ].some((term) => normalized.includes(term));
}
