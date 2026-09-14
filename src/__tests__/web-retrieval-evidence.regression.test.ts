import { describe, expect, it } from "vitest";
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
