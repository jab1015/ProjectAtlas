import { describe, expect, it } from "vitest";
import { latestWorkByKind, progressForWorkKinds } from "@convex/workLedgerProgressLogic";

describe("canonical work-ledger progress", () => {
  it("counts only the newest row for a refreshed work kind", () => {
    const progress = progressForWorkKinds([
      { kind: "competitor_discovery", status: "completed", updatedAt: 1 },
      { kind: "competitor_discovery", status: "queued", updatedAt: 2 },
      { kind: "market_feasibility", status: "completed", updatedAt: 1 },
    ], ["competitor_discovery", "market_feasibility"]);
    expect(progress.completed).toBe(1);
    expect(progress.progressPercent).toBe(50);
    expect(latestWorkByKind([{ kind: "competitor_discovery", status: "queued", updatedAt: 2 }, { kind: "competitor_discovery", status: "completed", updatedAt: 1 }])).toHaveLength(1);
  });

  it("does not report 100% while the latest required row is queued", () => {
    const progress = progressForWorkKinds([
      { kind: "competitor_discovery", status: "completed", updatedAt: 1 },
      { kind: "market_feasibility", status: "queued", updatedAt: 2 },
    ], ["competitor_discovery", "market_feasibility"]);
    expect(progress.allComplete).toBe(false);
    expect(progress.progressPercent).toBe(50);
  });
});
