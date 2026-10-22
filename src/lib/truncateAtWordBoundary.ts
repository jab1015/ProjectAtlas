export function truncateAtWordBoundary(value: string, maxLength: number): string {
  const normalized = value.trim();
  if (normalized.length <= maxLength) return normalized;
  const limit = Math.max(0, maxLength);
  const boundary = normalized.lastIndexOf(" ", limit);
  const end = boundary > 0 ? boundary : limit;
  return `${normalized.slice(0, end).trimEnd()}…`;
}
