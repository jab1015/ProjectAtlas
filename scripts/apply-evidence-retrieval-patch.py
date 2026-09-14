from pathlib import Path


def replace(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text()
    if old not in text:
        raise SystemExit(f"Patch anchor not found in {path}: {old[:160]!r}")
    file.write_text(text.replace(old, new, 1))


Path("convex/webRetrievalEvidenceLogic.ts").write_text(r'''import { sanitizeSourceUrls, type RawFinding } from "./evidenceIntegrityLogic";

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
''')

replace(
    "convex/atlasWorkOrchestration.ts",
    'import { buildPitchDeckArtifact } from "./pitchDeckArtifact";',
    'import { buildPitchDeckArtifact } from "./pitchDeckArtifact";\nimport { buildTraceableRetrievalRecords } from "./webRetrievalEvidenceLogic";',
)
replace(
    "convex/atlasWorkOrchestration.ts",
    '          tools: needsWebResearch(workItem) ? [{ type: "web_search" as const, search_context_size: "low" as const }] : undefined,',
    '          tools: needsWebResearch(workItem) ? [{ type: "web_search" as const, search_context_size: "low" as const }] : undefined,\n          include: needsWebResearch(workItem) ? ["web_search_call.action.sources" as const] : undefined,',
)
replace(
    "convex/atlasWorkOrchestration.ts",
    '        const result = JSON.parse(response.output_text);\n        if (result.needsHuman) {',
    '        const result = JSON.parse(response.output_text);\n        const retrievalEvidence = needsWebResearch(workItem)\n          ? buildTraceableRetrievalRecords(response.output, result.findings, Date.now())\n          : [];\n        if (result.needsHuman) {',
)
replace(
    "convex/atlasWorkOrchestration.ts",
    '          verifiedSources: result.verifiedSources,\n          storageId,',
    '          verifiedSources: result.verifiedSources,\n          retrievalEvidence,\n          storageId,',
)

replace(
    "convex/atlasWorkState.ts",
    '''const sourceVerificationValidator = v.object({
  sourceUrl: v.string(),
  status: v.union(v.literal("verified_primary"), v.literal("verified_authoritative_secondary"), v.literal("verified_secondary"), v.literal("unverified"), v.literal("disputed")),
  notes: v.string(),
});''',
    '''const sourceVerificationValidator = v.object({
  sourceUrl: v.string(),
  status: v.union(v.literal("verified_primary"), v.literal("verified_authoritative_secondary"), v.literal("verified_secondary"), v.literal("unverified"), v.literal("disputed")),
  notes: v.string(),
});

const retrievalEvidenceValidator = v.object({
  sourceUrl: v.string(),
  retrievedAt: v.number(),
  provider: v.literal("openai_web_search"),
  providerTitle: v.optional(v.string()),
  claimSupportText: v.string(),
});''',
)
replace(
    "convex/atlasWorkState.ts",
    '    verifiedSources: v.array(sourceVerificationValidator),\n    storageId: v.optional(v.id("_storage")),',
    '    verifiedSources: v.array(sourceVerificationValidator),\n    retrievalEvidence: v.array(retrievalEvidenceValidator),\n    storageId: v.optional(v.id("_storage")),',
)
replace(
    "convex/atlasWorkState.ts",
    '      const verificationByUrl = new Map(args.verifiedSources.map((verification) => [verification.sourceUrl, verification]));\n      for (const source of existingSources) {',
    '      const verificationByUrl = new Map(args.verifiedSources.map((verification) => [sanitizeSourceUrls([verification.sourceUrl])[0], verification]).filter((entry): entry is [string, typeof args.verifiedSources[number]] => Boolean(entry[0])));\n      const retrievalByUrl = new Map(args.retrievalEvidence.map((evidence) => [sanitizeSourceUrls([evidence.sourceUrl])[0], evidence]).filter((entry): entry is [string, typeof args.retrievalEvidence[number]] => Boolean(entry[0])));\n      for (const source of existingSources) {',
)
replace(
    "convex/atlasWorkState.ts",
    '''        const verification = verificationByUrl.get(source.locator);
        if (!verification) continue;
        const reliability = reliabilityFromVerificationStatus(verification.status);
        await ctx.db.patch(source._id, {
          reliability,
          metadata: { ...(source.metadata ?? {}), verificationStatus: verification.status, verificationNotes: verification.notes, verifiedAt: args.completedAt },
        });''',
    '''        const normalizedLocator = sanitizeSourceUrls([source.locator])[0];
        if (!normalizedLocator) continue;
        const verification = verificationByUrl.get(normalizedLocator);
        if (!verification) continue;
        const retrieval = retrievalByUrl.get(normalizedLocator);
        const reliability = reliabilityFromVerificationStatus(verification.status, retrieval ? {
          retrievalRecordedAt: retrieval.retrievedAt,
          retrievalSourceUrl: retrieval.sourceUrl,
          claimSupportExcerpt: retrieval.claimSupportText,
        } : undefined);
        await ctx.db.patch(source._id, {
          reliability,
          metadata: {
            ...(source.metadata ?? {}),
            verificationStatus: verification.status,
            verificationNotes: verification.notes,
            verifiedAt: args.completedAt,
            retrievalRecordedAt: retrieval?.retrievedAt,
            retrievalSourceUrl: retrieval?.sourceUrl,
            retrievalProvider: retrieval?.provider,
            retrievalProviderTitle: retrieval?.providerTitle,
            claimSupportExcerpt: retrieval?.claimSupportText,
            claimSupportKind: retrieval ? "provider_retrieved_url_claim_association" : undefined,
          },
        });''',
)
replace(
    "convex/atlasWorkState.ts",
    '      const disputedSourceIds = new Set(existingSources.filter((source) => source.locator && verificationByUrl.get(source.locator)?.status === "disputed").map((source) => String(source._id)));',
    '      const disputedSourceIds = new Set(existingSources.filter((source) => source.locator && verificationByUrl.get(sanitizeSourceUrls([source.locator])[0] ?? "")?.status === "disputed").map((source) => String(source._id)));',
)

Path("src/__tests__/web-retrieval-evidence.regression.test.ts").write_text(r'''import { describe, expect, it } from "vitest";
import { buildTraceableRetrievalRecords, extractProviderWebSources } from "@convex/webRetrievalEvidenceLogic";

const providerOutput = [
  {
    type: "web_search_call",
    action: {
      type: "search",
      sources: [
        { type: "url", url: "https://example.com/report#section", title: "Example Report" },
        { type: "url", url: "javascript:alert(1)", title: "Bad" },
      ],
    },
  },
];

describe("traceable provider web retrieval evidence", () => {
  it("extracts only normalized provider-returned web search source URLs", () => {
    expect(extractProviderWebSources(providerOutput)).toEqual([
      { sourceUrl: "https://example.com/report", title: "Example Report" },
    ]);
  });

  it("binds sourced claims only to URLs the provider actually retrieved", () => {
    const records = buildTraceableRetrievalRecords(providerOutput, [
      {
        statement: "The retrieved report supports the material claim.",
        kind: "sourced_fact",
        confidence: 0.8,
        sourceUrls: ["https://example.com/report", "https://fabricated.example/not-retrieved"],
        assumptions: [],
        limitations: [],
      },
    ], 12345);
    expect(records).toEqual([{
      sourceUrl: "https://example.com/report",
      retrievedAt: 12345,
      provider: "openai_web_search",
      providerTitle: "Example Report",
      claimSupportText: "The retrieved report supports the material claim.",
    }]);
  });

  it("does not create trust evidence from a provider URL without a sourced-fact claim association", () => {
    expect(buildTraceableRetrievalRecords(providerOutput, [{
      statement: "Unrelated inference.",
      kind: "ai_inference",
      confidence: 0.4,
      sourceUrls: ["https://example.com/report"],
      assumptions: [],
      limitations: [],
    }], 12345)).toEqual([]);
  });
});
''')
