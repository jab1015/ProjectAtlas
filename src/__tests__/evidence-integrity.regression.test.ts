import { describe, expect, it } from "vitest";
import { canPromoteDeliverable, isSourceEligibleForPromotion, normalizeFinding, reliabilityFromVerificationStatus, sanitizeSourceUrls, SOURCE_VERIFICATION_MAX_AGE_MS } from "@convex/evidenceIntegrityLogic";

describe("evidence source integrity", () => {
  it("keeps only deduplicated HTTP sources and removes fragments", () => {
    expect(sanitizeSourceUrls([
      "https://example.com/report#page-2",
      "https://example.com/report",
      "javascript:alert(1)",
      "not a url",
    ])).toEqual(["https://example.com/report"]);
  });

  it("downgrades an unsupported sourced fact to a bounded inference", () => {
    const finding = normalizeFinding({
      statement: "The market is growing.",
      kind: "sourced_fact",
      confidence: 0.9,
      sourceUrls: [],
      assumptions: [],
      limitations: [],
    });
    expect(finding.kind).toBe("ai_inference");
    expect(finding.confidence).toBe(0.49);
    expect(finding.limitations[0]).toContain("no valid source URL");
  });

  it("bounds confidence even when a source is present", () => {
    const finding = normalizeFinding({
      statement: "A source says this.",
      kind: "sourced_fact",
      confidence: 3,
      sourceUrls: ["https://example.com"],
      assumptions: [],
      limitations: [],
    });
    expect(finding.confidence).toBe(1);
  });
});

describe("evidence promotion", () => {
  it("maps only explicit successful verification to trusted reliability", () => {
    expect(reliabilityFromVerificationStatus("verified_primary")).toBe("primary");
    expect(reliabilityFromVerificationStatus("disputed")).toBe("unverified");
  });

  it("requires verified sources and material source coverage before promotion", () => {
    const reliable = new Set(["source-1", "source-2"]);
    expect(canPromoteDeliverable(["source-1", "source-2"], reliable, 0.8)).toBe(true);
    expect(canPromoteDeliverable(["source-1", "missing"], reliable, 0.8)).toBe(false);
    expect(canPromoteDeliverable(["source-1"], reliable, 0.2)).toBe(false);
  });

  it("requires a recent, non-future verification before trusting a source", () => {
    const now = 2_000_000_000_000;
    expect(isSourceEligibleForPromotion({ reliability: "primary", locator: "https://example.com/patent", metadata: { verifiedAt: now - 1_000 } }, now)).toBe(true);
    expect(isSourceEligibleForPromotion({ reliability: "primary", metadata: { verifiedAt: now - SOURCE_VERIFICATION_MAX_AGE_MS - 1 } }, now)).toBe(false);
    expect(isSourceEligibleForPromotion({ reliability: "primary", metadata: { verifiedAt: now + 1 } }, now)).toBe(false);
    expect(isSourceEligibleForPromotion({ reliability: "primary", locator: "javascript:alert(1)", metadata: { verifiedAt: now } }, now)).toBe(false);
  });
});
