import { sanitizeSourceUrls, type RawFinding } from "./evidenceIntegrityLogic";

export interface ProviderWebSourceRecord {
  sourceUrl: string;
  title?: string;
}

export interface TraceableRetrievalRecord {
  sourceUrl: string;
  retrievedAt: number;
  provider: "openai_web_search";
  providerTitle?: string;
  /** Claim text associated with this exact provider-returned URL. This is not a verbatim source quote. */
  claimSupportText: string;
}

function normalizedUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return sanitizeSourceUrls([value])[0];
}

/** Extract only URLs returned inside provider web_search_call source records. */
export function extractProviderWebSources(output: unknown): ProviderWebSourceRecord[] {
  const found = new Map<string, ProviderWebSourceRecord>();
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    const record = value as Record<string, unknown>;
    if (record.type === "web_search_call") {
      const action = record.action && typeof record.action === "object"
        ? record.action as Record<string, unknown>
        : undefined;
      const sources = Array.isArray(action?.sources) ? action.sources : [];
      for (const raw of sources) {
        if (!raw || typeof raw !== "object") continue;
        const source = raw as Record<string, unknown>;
        const sourceUrl = normalizedUrl(source.url);
        if (!sourceUrl) continue;
        const title = typeof source.title === "string" && source.title.trim()
          ? source.title.trim().slice(0, 500)
          : undefined;
        found.set(sourceUrl, { sourceUrl, title });
      }
    }
    for (const child of Object.values(record)) visit(child);
  };
  visit(output);
  return [...found.values()];
}

/**
 * Bind model claims only to URLs the provider independently reports as retrieved.
 * claimSupportText records the claim-to-source association; it is never a quote.
 */
export function buildTraceableRetrievalRecords(
  output: unknown,
  findings: RawFinding[],
  retrievedAt: number
): TraceableRetrievalRecord[] {
  const providerSources = new Map(
    extractProviderWebSources(output).map((source) => [source.sourceUrl, source])
  );
  const claimsByUrl = new Map<string, string[]>();
  for (const finding of findings) {
    if (finding.kind !== "sourced_fact") continue;
    for (const sourceUrl of sanitizeSourceUrls(finding.sourceUrls)) {
      if (!providerSources.has(sourceUrl)) continue;
      const claims = claimsByUrl.get(sourceUrl) ?? [];
      const statement = finding.statement.trim();
      if (statement && !claims.includes(statement)) claims.push(statement);
      claimsByUrl.set(sourceUrl, claims);
    }
  }
  const records: TraceableRetrievalRecord[] = [];
  for (const [sourceUrl, claims] of claimsByUrl) {
    if (!claims.length) continue;
    const providerSource = providerSources.get(sourceUrl)!;
    records.push({
      sourceUrl,
      retrievedAt,
      provider: "openai_web_search",
      providerTitle: providerSource.title,
      claimSupportText: claims.join("\n").slice(0, 4000),
    });
  }
  return records;
}
