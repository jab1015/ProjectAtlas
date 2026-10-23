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

  it("does not present dependency-blocked queued work as next in line", () => {
    const briefing = buildStatusBriefing({
      workItems: [
        { kind: "engineering_handoff", title: "Prepare engineering handoff", status: "queued", updatedAt: 1, dependsOnKinds: ["product_requirements", "development_risks"] },
        { kind: "assumptions_unknowns", title: "Build assumptions register", status: "queued", updatedAt: 2 },
      ],
      decisions: [], approvals: [], findings: [],
    });
    expect(briefing.next[0]).toMatchObject({ title: "Build assumptions register", status: "queued" });
    expect(briefing.next[1]).toMatchObject({ title: "Prepare engineering handoff", status: "waiting", waitingFor: ["product_requirements", "development_risks"] });
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

  it("does not present a professional handoff gate as an inventor task", () => {
    const briefing = buildStatusBriefing({
      workItems: [
        {
          kind: "patent_design_handoff",
          title: "Patent-to-design handoff",
          status: "blocked",
          blockedReason: "Qualified patent counsel review is required.",
          updatedAt: 10,
        },
      ],
      decisions: [],
      approvals: [],
      findings: [],
    });

    expect(briefing.needsInventor).toEqual([]);
  });

  it("does not turn a stale autonomous brief-analysis gate into an inventor task", () => {
    const briefing = buildStatusBriefing({
      workItems: [
        {
          kind: "brief_analysis",
          title: "Analyze the invention brief",
          status: "blocked",
          blockedReason: "A prototype specialist must validate torque and leakage.",
          updatedAt: 10,
        },
      ],
      decisions: [],
      approvals: [],
      findings: [],
    });
    expect(briefing.needsInventor).toEqual([]);
  });

  it("prioritizes Internal Legal Patent Readiness over downstream handoff work", () => {
    const briefing = buildStatusBriefing({
      workItems: [
        { kind: "engineering_handoff", title: "Prepare engineering handoff", status: "queued", updatedAt: 1, dependsOnKinds: ["development_risks"] },
        { kind: "preliminary_prior_art", title: "Preliminary prior-art landscape", status: "completed", updatedAt: 2 },
        { kind: "feature_prior_art_comparison", title: "Compare features against prior art", status: "completed", updatedAt: 3 },
        { kind: "distinguishing_features", title: "Develop distinguishing features", status: "completed", updatedAt: 4 },
        { kind: "ip_readiness", title: "Prepare patent readiness packet", status: "completed", updatedAt: 5 },
        { kind: "patent_design_handoff", title: "Patent-to-design handoff", status: "blocked", updatedAt: 6, blockedReason: "Internal Legal review" },
      ],
      decisions: [], approvals: [], findings: [],
    });

    expect(briefing.currentWork).toMatchObject({
      department: "Internal Legal",
      stage: "Patent Readiness",
      status: "waiting",
      completedTasks: 4,
      totalTasks: 5,
      progressPercent: 80,
    });
    expect(briefing.next[0]).toMatchObject({ title: "Internal Legal review of Patent Readiness", status: "waiting" });
  });
});
