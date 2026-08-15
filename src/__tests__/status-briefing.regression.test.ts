import { describe, expect, it } from "vitest";
import { buildStatusBriefing } from "@convex/statusBriefingLogic";

describe("InventSmith status briefing", () => {
  it("returns the four inventor-facing briefing sections", () => {
    const briefing = buildStatusBriefing({
      workItems: [
        {
          title: "Competitor scan",
          status: "completed",
          outputSummary: "Found five relevant alternatives.",
          updatedAt: 30,
        },
        { title: "Prior-art search", status: "running", updatedAt: 40 },
        { title: "Materials review", status: "queued", updatedAt: 50 },
      ],
      findings: [
        {
          statement: "Two products solve the same problem differently.",
          status: "evidence_checked",
          confidence: 0.8,
          updatedAt: 25,
        },
      ],
      decisions: [
        {
          title: "Select target customer",
          question: "Should InventSmith focus first on older adults?",
          status: "open",
          createdAt: 10,
        },
      ],
      approvals: [
        {
          summary: "Share the engineering brief with the selected reviewer.",
          status: "pending",
          requestedAt: 20,
        },
      ],
    });

    expect(briefing.completed[0].title).toBe("Competitor scan");
    expect(briefing.discoveries).toHaveLength(1);
    expect(briefing.needsInventor.map((item) => item.type)).toEqual([
      "decision",
      "approval",
    ]);
    expect(briefing.next).toEqual([
      { title: "Prior-art search", status: "running", requiredTier: undefined },
      { title: "Materials review", status: "queued", requiredTier: undefined },
    ]);
  });

  it("shows higher-tier queued work as locked instead of pretending it will run", () => {
    const briefing = buildStatusBriefing({
      subscriptionTier: "free",
      workItems: [
        { kind: "concept_image_generation", title: "Concept image", status: "queued", updatedAt: 1 },
        { kind: "preliminary_prior_art", title: "Prior art", status: "queued", updatedAt: 2 },
      ],
      decisions: [], approvals: [], findings: [],
    });
    expect(briefing.next).toEqual([
      { title: "Prior art", status: "queued", requiredTier: "free" },
      { title: "Concept image", status: "locked", requiredTier: "pro" },
    ]);
  });

  it("excludes draft and low-confidence findings", () => {
    const briefing = buildStatusBriefing({
      workItems: [],
      decisions: [],
      approvals: [],
      findings: [
        { statement: "Draft", status: "draft", confidence: 0.9, updatedAt: 2 },
        {
          statement: "Weak evidence",
          status: "evidence_checked",
          confidence: 0.49,
          updatedAt: 1,
        },
      ],
    });

    expect(briefing.discoveries).toEqual([]);
  });

  it("surfaces blocked work as an inventor need", () => {
    const briefing = buildStatusBriefing({
      workItems: [
        {
          title: "Regulatory screening",
          status: "blocked",
          blockedReason: "Confirm the states where the product will be sold.",
          updatedAt: 10,
        },
      ],
      decisions: [],
      approvals: [],
      findings: [],
    });

    expect(briefing.needsInventor[0]).toMatchObject({
      type: "blocked_work",
      title: "Regulatory screening",
    });
  });
});
