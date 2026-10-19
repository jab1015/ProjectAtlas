import { describe, expect, it } from "vitest";
import { applyInventorEvidenceChange } from "@convex/evidenceImpact";

function buildState() {
  const tables: Record<string, any[]> = {
    inventions: [{ _id: "inv-1", updatedAt: 1 }],
    inventionRecords: [{ _id: "record-1", inventionId: "inv-1", structuredBrief: {}, updatedAt: 1 }],
    atlasWorkItems: [
      { _id: "validation", inventionId: "inv-1", kind: "validation_research", status: "completed", attemptCount: 1, outputSummary: "old validation", updatedAt: 1 },
      { _id: "design", inventionId: "inv-1", kind: "product_design_specification", status: "completed", attemptCount: 1, outputSummary: "old design", updatedAt: 1 },
      { _id: "marketing", inventionId: "inv-1", kind: "marketing_plan", status: "completed", attemptCount: 1, outputSummary: "old marketing", updatedAt: 1 },
      { _id: "idea", inventionId: "inv-1", kind: "idea_capture", status: "completed", attemptCount: 1, outputSummary: "keep original idea", updatedAt: 1 },
    ],
    atlasDeliverables: [],
    evidenceFindings: [],
    atlasExecutionEvents: [],
  };
  const ctx = {
    db: {
      get: async (id: string) => Object.values(tables).flat().find((row) => row._id === String(id)) ?? null,
      patch: async (id: string, patch: Record<string, unknown>) => Object.assign(Object.values(tables).flat().find((row) => row._id === String(id)), patch),
      insert: async (table: string, doc: Record<string, unknown>) => {
        const id = `${table}-${(tables[table]?.length ?? 0) + 1}`;
        (tables[table] ??= []).push({ _id: id, ...structuredClone(doc) });
        return id;
      },
      query: (table: string) => ({
        withIndex: (_index: string, _callback: unknown) => ({
          unique: async () => tables[table]?.[0] ?? null,
          collect: async () => tables[table] ?? [],
        }),
      }),
    },
  } as any;
  return { ctx, tables };
}

describe("automatic department refresh", () => {
  it("requeues every department when a survey is added and preserves the original idea capture", async () => {
    const state = buildState();
    await applyInventorEvidenceChange(state.ctx, "inv-1" as any, {
      action: "uploaded",
      sourceId: "survey-source" as any,
      label: "RiseJars survey — 100 respondents",
      evidenceKind: "survey",
      extraction: { mode: "structured", respondentCount: 100 },
      now: 100,
    });

    expect(state.tables.atlasWorkItems).toEqual(expect.arrayContaining([
      expect.objectContaining({ _id: "validation", status: "queued", attemptCount: 0, outputSummary: undefined }),
      expect.objectContaining({ _id: "design", status: "queued", attemptCount: 0, outputSummary: undefined }),
      expect.objectContaining({ _id: "marketing", status: "queued", attemptCount: 0, outputSummary: undefined }),
      expect.objectContaining({ _id: "idea", status: "completed", outputSummary: "keep original idea" }),
    ]));
    expect(state.tables.inventionRecords[0].structuredBrief.inventorEvidence).toEqual([
      expect.objectContaining({ sourceId: "survey-source", evidenceKind: "survey" }),
    ]);
    expect(state.tables.atlasExecutionEvents).toEqual(expect.arrayContaining([
      expect.objectContaining({ metadata: expect.objectContaining({ changeType: "inventor_evidence" }) }),
    ]));
  });
});
