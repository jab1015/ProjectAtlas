export type FindingKind = "sourced_fact" | "inventor_statement" | "estimate" | "ai_inference";

export interface RawFinding {
  statement: string;
  kind: FindingKind;
  confidence: number;
  sourceUrls: string[];
  assumptions: string[];
  limitations: string[];
}

export function sanitizeSourceUrls(urls: string[]): string[] {
  const clean = urls.flatMap((value) => {
    try {
      const url = new URL(value.trim());
      if (url.protocol !== "https:" && url.protocol !== "http:") return [];
      url.hash = "";
      return [url.toString()];
    } catch {
      return [];
    }
  });
  return [...new Set(clean)].slice(0, 20);
}

export function normalizeFinding(finding: RawFinding): RawFinding {
  const sourceUrls = sanitizeSourceUrls(finding.sourceUrls);
  if (finding.kind === "sourced_fact" && sourceUrls.length === 0) {
    return {
      ...finding,
      kind: "ai_inference",
      confidence: Math.min(0.49, Math.max(0, finding.confidence)),
      sourceUrls,
      limitations: [
        ...finding.limitations,
        "Atlas received no valid source URL for this claim, so it is recorded as an inference rather than a sourced fact.",
      ],
    };
  }
  return {
    ...finding,
    confidence: Math.max(0, Math.min(1, finding.confidence)),
    sourceUrls,
  };
}

export type VerificationStatus = "verified_primary" | "verified_authoritative_secondary" | "verified_secondary" | "unverified" | "disputed";

export function reliabilityFromVerificationStatus(status: VerificationStatus) {
  if (status === "verified_primary") return "primary" as const;
  if (status === "verified_authoritative_secondary") return "authoritative_secondary" as const;
  if (status === "verified_secondary") return "secondary" as const;
  return "unverified" as const;
}

export const SOURCE_VERIFICATION_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
export const EVIDENCE_FRESHNESS_STALE_REASON = "One or more supporting sources require fresh verification before Atlas can rely on this output.";

export function isSourceEligibleForPromotion(
  source: { reliability: string; locator?: string; metadata?: unknown },
  now: number
): boolean {
  if (source.reliability === "unverified") return false;
  const metadata = source.metadata && typeof source.metadata === "object" ? source.metadata as Record<string, unknown> : {};
  const verifiedAt = typeof metadata.verifiedAt === "number" ? metadata.verifiedAt : undefined;
  if (!verifiedAt || verifiedAt > now || now - verifiedAt > SOURCE_VERIFICATION_MAX_AGE_MS) return false;
  if (source.locator && sanitizeSourceUrls([source.locator]).length !== 1) return false;
  return true;
}

export function canPromoteDeliverable(
  sourceIds: string[],
  reliableSourceIds: Set<string>,
  sourceCoverage: number | undefined
): boolean {
  return sourceIds.length > 0 &&
    sourceIds.every((sourceId) => reliableSourceIds.has(sourceId)) &&
    (sourceCoverage ?? 0) >= 0.5;
}
