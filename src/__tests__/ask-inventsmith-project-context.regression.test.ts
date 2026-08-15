import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const chatSource = readFileSync("convex/atlasChat.ts", "utf8");
const actionSource = readFileSync("convex/atlasChatAction.ts", "utf8");

describe("Ask InventSmith project-wide grounding", () => {
  it("loads the operational ledgers needed to verify cross-department state", () => {
    for (const table of [
      "evidenceSources",
      "evidenceFindings",
      "inventionAssumptions",
      "inventionDecisions",
      "approvalRequests",
      "atlasWorkItems",
      "atlasDeliverables",
      "deliverableDependencies",
      "professionalReviews",
      "atlasExecutionEvents",
      "stageProgress",
      "validationResearch",
    ]) {
      expect(chatSource).toContain(`query(\"${table}\")`);
    }
    expect(chatSource).toContain("FULL_JOURNEY_STAGES");
    expect(chatSource).toContain("initializedWorkCount");
  });

  it("requires Ask InventSmith to resolve handoffs from dependencies and work status", () => {
    expect(actionSource).toContain("downstream work item that is queued/running");
    expect(actionSource).toContain("operational handoff has occurred");
    expect(actionSource).toContain("Do not require a separate ceremonial 'handoff record'");
    expect(actionSource).toContain("Never respond that you cannot see across the app");
  });

  it("keeps patent/design coordination evidence-driven rather than guaranteeing patentability", () => {
    expect(actionSource).toContain("Patent and design are coordinated workstreams");
    expect(actionSource).toContain("not as a guarantee of patentability");
    expect(actionSource).toContain("professionalReviews");
    expect(actionSource).toContain("externalResearchEnabledForThisTurn");
  });
});
