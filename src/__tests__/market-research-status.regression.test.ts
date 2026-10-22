import { describe, expect, it } from "vitest";
import { getMarketResearchNoDeliverableMessage } from "@/lib/marketResearchStatus";

describe("market research deliverable status", () => {
  it("does not call market work complete when a work item is still queued", () => {
    const message = getMarketResearchNoDeliverableMessage({
      total: 2,
      completed: 1,
      queued: 1,
      running: 0,
      failed: 0,
      blocked: 0,
    });

    expect(message.title).toBe("Some market research is complete; more work remains.");
    expect(message.detail).toContain("1 of 2 market work items are complete");
    expect(message.detail).toContain("1 queued");
    expect(message.detail).toContain("No combined market deliverable is saved yet");
  });

  it("reports a completed ledger with a missing deliverable as a sync/support issue", () => {
    const message = getMarketResearchNoDeliverableMessage({
      total: 2,
      completed: 2,
      queued: 0,
      running: 0,
      failed: 0,
      blocked: 0,
    });

    expect(message.title).toContain("All market research work items are complete");
    expect(message.detail).toContain("contact support if the report still does not appear");
  });
});
