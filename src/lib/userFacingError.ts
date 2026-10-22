/** Keep useful validation and permission messages while hiding transport and trace details. */
export function userFacingError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  if (/^(?:TypeError|ReferenceError|SyntaxError|RangeError|URIError)$/i.test(error.name)) return fallback;
  const message = error.message
    .replace(/^\s*(?:Uncaught\s+)?(?:ConvexError|Error):\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!message || message.length > 300) return fallback;
  if (/\brequest[\s_-]*id\b|^\s*(?:TypeError|ReferenceError|SyntaxError|RangeError):|\b(?:stack trace|internal server error|failed to fetch|fetch failed)\b/i.test(message)) return fallback;
  return message;
}
