import { describe, expect, it } from "vitest";

import { applyInventorEvidenceChange } from "@convex/evidenceImpact";

type Row = Record<string, any> & { _id: string };
type Tables = Record<string, Row[]>;

function buildState(initial: Tables) {
  const tables: Tables = Object.fromEntries(
    Object.entries(initial).map(([name, rows]) => [name, rows.map((row) => structuredClone(row))]),
  );
  const inserted: Array<{ table: string; doc: Record<string, unknown> }> = [];

  const findRow = (id: string) => {
    for (const rows of Object.values(tables)) {
      const row = rows.find((candidate) => candidate._id === id);
      if (row) return row;
    }
    return null;
  };

  const ctx = {
    db: {
      get: async (id: string) => findRow(String(id)),
      patch: async (id: string, patch: Record<string, unknown>) => {
        const row = findRow(String(id));
        if (!row) throw new Error(`Missing fake row ${String(id)}`);
        Object.assign(row, patch);
      },
      insert: async (table: string, doc: Record<string, unknown>) => {
        const id = `${table}_${(tables[table]?.length ?? 0) + 1}`;
        (tables[table] ??= []).push({ _id: id, ...structuredClone(doc) });
        inserted.push({ table, doc: structuredClone(doc) });
        return id;
      },
      query: (table: string) => ({
        withIndex: (_index: string, _callback: unknown) => ({
          unique: async () => (tables[table] ?? [])[0] ?? null,
          collect: async () => tables[table] ?? [],
        }),
      }),
    },
  } as any;

  return { ctx, tables, inserted };
}

describe("representative persisted lifecycle behavior", () => {
  it("re-closes a hybrid manufacturing path when quote evidence is removed without invalidating unrelated software work", async () => {
    const state = buildState({
      inventions: [{ _id: "inv_hybrid", updatedAt: 50 }],
      inventionRecords: [{
        _id: "record_hybrid",
        inventionId: "inv_hybrid",
        structuredBrief: {
          inventorEvidence: [{
            sourceId: "quote_source",
            label: "Supplier quote",
            evidenceKind: "manufacturer_quote",
            provenance: "inventor_upload",
          }],
        },
        updatedAt: 50,
      }],
      atlasWorkItems: [
        {
          _id: "quote_gate",
          inventionId: "inv_hybrid",
          kind: "manufacturer_quote_evidence",
          status: "completed",
          attemptCount: 1,
          completedAt: 60,
          outputSummary: "Quote verified",
          dependsOnKinds: ["manufacturer_rfq_package"],
          updatedAt: 60,
        },
        {
          _id: "unit_economics",
          inventionId: "inv_hybrid",
          kind: "manufacturing_unit_economics",
          status: "completed",
          attemptCount: 1,
          completedAt: 61,
          outputSummary: "Unit economics based on supplier quote",
          dependsOnKinds: ["manufacturer_quote_evidence"],
          updatedAt: 61,
        },
        {
          _id: "quote_compare",
          inventionId: "inv_hybrid",
          kind: "manufacturer_quote_comparison",
          status: "completed",
          attemptCount: 1,
          completedAt: 62,
          outputSummary: "Compared quote options",
          dependsOnKinds: ["manufacturer_quote_evidence", "manufacturing_unit_economics"],
          updatedAt: 62,
        },
        {
          _id: "manufacturing_ready",
          inventionId: "inv_hybrid",
          kind: "manufacturing_readiness",
          status: "completed",
          attemptCount: 1,
          completedAt: 63,
          outputSummary: "Manufacturing path ready",
          dependsOnKinds: ["manufacturer_quote_comparison"],
          updatedAt: 63,
        },
        {
          _id: "software_security",
          inventionId: "inv_hybrid",
          kind: "software_security_privacy_review",
          status: "completed",
          attemptCount: 1,
          completedAt: 64,
          outputSummary: "Software security review complete",
          dependsOnKinds: ["software_architecture"],
          updatedAt: 64,
        },
      ],
      atlasDeliverables: [
        {
          _id: "manufacturing_deliverable",
          inventionId: "inv_hybrid",
          workItemId: "quote_compare",
          sourceIds: ["quote_source", "other_source"],
          staleReason: undefined,
          updatedAt: 62,
        },
        {
          _id: "software_deliverable",
          inventionId: "inv_hybrid",
          workItemId: "software_security",
          sourceIds: ["software_source"],
          staleReason: undefined,
          updatedAt: 64,
        },
      ],
      deliverableDependencies: [{
        _id: "dep_finding",
        inventionId: "inv_hybrid",
        deliverableId: "manufacturing_deliverable",
        dependencyType: "finding",
        dependencyId: "finding_quote",
      }],
      evidenceFindings: [
        {
          _id: "finding_quote",
          inventionId: "inv_hybrid",
          sourceIds: ["other_source"],
          status: "evidence_checked",
          updatedAt: 62,
        },
        {
          _id: "finding_software",
          inventionId: "inv_hybrid",
          sourceIds: ["software_source"],
          status: "evidence_checked",
          updatedAt: 64,
        },
      ],
      atlasExecutionEvents: [],
    });

    await applyInventorEvidenceChange(state.ctx, "inv_hybrid" as any, {
      action: "removed",
      sourceId: "quote_source" as any,
      label: "Supplier quote",
      evidenceKind: "manufacturer_quote",
      now: 100,
    });

    const byWorkId = new Map(state.tables.atlasWorkItems.map((row) => [row._id, row]));
    expect(byWorkId.get("quote_gate")).toMatchObject({
      status: "blocked",
      attemptCount: 0,
      humanGateType: "authorization",
      updatedAt: 100,
    });
    expect(byWorkId.get("quote_gate")?.blockedReason).toMatch(/current real manufacturer quote\/RFQ response is required/i);

    for (const id of ["unit_economics", "quote_compare", "manufacturing_ready"]) {
      expect(byWorkId.get(id)).toMatchObject({ status: "queued", attemptCount: 0, updatedAt: 100 });
      expect(byWorkId.get(id)?.outputSummary).toBeUndefined();
      expect(byWorkId.get(id)?.lastError).toMatch(/Inventor evidence was removed: Supplier quote/i);
    }

    expect(byWorkId.get("software_security")).toMatchObject({
      status: "completed",
      outputSummary: "Software security review complete",
      updatedAt: 64,
    });

    const manufacturingDeliverable = state.tables.atlasDeliverables.find((row) => row._id === "manufacturing_deliverable")!;
    expect(manufacturingDeliverable.sourceIds).toEqual(["other_source"]);
    expect(manufacturingDeliverable.staleReason).toMatch(/Inventor evidence was removed: Supplier quote/i);
    expect(manufacturingDeliverable.updatedAt).toBe(100);

    const softwareDeliverable = state.tables.atlasDeliverables.find((row) => row._id === "software_deliverable")!;
    expect(softwareDeliverable.sourceIds).toEqual(["software_source"]);
    expect(softwareDeliverable.staleReason).toBeUndefined();
    expect(softwareDeliverable.updatedAt).toBe(64);

    const quoteFinding = state.tables.evidenceFindings.find((row) => row._id === "finding_quote")!;
    expect(quoteFinding).toMatchObject({ status: "stale", updatedAt: 100 });
    expect(quoteFinding.sourceIds).toEqual(["other_source"]);

    const softwareFinding = state.tables.evidenceFindings.find((row) => row._id === "finding_software")!;
    expect(softwareFinding).toMatchObject({ status: "evidence_checked", updatedAt: 64 });

    expect(state.tables.inventionRecords[0].structuredBrief.inventorEvidence).toEqual([]);
    expect(state.tables.inventions[0].updatedAt).toBe(100);
    expect(state.inserted).toEqual(expect.arrayContaining([
      expect.objectContaining({
        table: "atlasExecutionEvents",
        doc: expect.objectContaining({ eventType: "work_blocked", workItemId: "quote_gate" }),
      }),
      expect.objectContaining({
        table: "atlasExecutionEvents",
        doc: expect.objectContaining({
          eventType: "invention_changed",
          metadata: expect.objectContaining({ action: "removed", evidenceKind: "manufacturer_quote" }),
        }),
      }),
    ]));
  });

  it("re-closes a physical prototype path when prototype evidence is removed without invalidating unrelated market or prior-art work", async () => {
    const state = buildState({
      inventions: [{ _id: "inv_physical", updatedAt: 200 }],
      inventionRecords: [{
        _id: "record_physical",
        inventionId: "inv_physical",
        structuredBrief: {
          inventorEvidence: [
            {
              sourceId: "prototype_source",
              label: "Prototype bench-test results",
              evidenceKind: "prototype_test",
              provenance: "inventor_upload",
            },
            {
              sourceId: "market_source",
              label: "Customer interview notes",
              evidenceKind: "interview",
              provenance: "inventor_upload",
            },
          ],
        },
        updatedAt: 200,
      }],
      atlasWorkItems: [
        {
          _id: "prototype_gate",
          inventionId: "inv_physical",
          kind: "prototype_physical_evidence",
          status: "completed",
          attemptCount: 1,
          completedAt: 210,
          outputSummary: "Prototype evidence verified",
          dependsOnKinds: ["prototype_test_plan"],
          updatedAt: 210,
        },
        {
          _id: "prototype_assessment",
          inventionId: "inv_physical",
          kind: "prototype_evidence_assessment",
          status: "completed",
          attemptCount: 1,
          completedAt: 211,
          outputSummary: "Prototype evidence supports next-step work",
          dependsOnKinds: ["prototype_physical_evidence"],
          updatedAt: 211,
        },
        {
          _id: "rfq_package",
          inventionId: "inv_physical",
          kind: "manufacturer_rfq_package",
          status: "completed",
          attemptCount: 1,
          completedAt: 212,
          outputSummary: "RFQ package based on tested prototype",
          dependsOnKinds: ["prototype_evidence_assessment"],
          updatedAt: 212,
        },
        {
          _id: "manufacturing_ready",
          inventionId: "inv_physical",
          kind: "manufacturing_readiness",
          status: "completed",
          attemptCount: 1,
          completedAt: 213,
          outputSummary: "Manufacturing readiness based on prototype path",
          dependsOnKinds: ["manufacturer_rfq_package"],
          updatedAt: 213,
        },
        {
          _id: "market_analysis",
          inventionId: "inv_physical",
          kind: "market_analysis",
          status: "completed",
          attemptCount: 1,
          completedAt: 214,
          outputSummary: "Market analysis complete",
          dependsOnKinds: ["market_research"],
          updatedAt: 214,
        },
        {
          _id: "prior_art",
          inventionId: "inv_physical",
          kind: "preliminary_prior_art",
          status: "completed",
          attemptCount: 1,
          completedAt: 215,
          outputSummary: "Prior-art review complete",
          updatedAt: 215,
        },
      ],
      atlasDeliverables: [
        {
          _id: "prototype_deliverable",
          inventionId: "inv_physical",
          workItemId: "prototype_assessment",
          sourceIds: ["prototype_source", "design_source"],
          staleReason: undefined,
          updatedAt: 211,
        },
        {
          _id: "market_deliverable",
          inventionId: "inv_physical",
          workItemId: "market_analysis",
          sourceIds: ["market_source"],
          staleReason: undefined,
          updatedAt: 214,
        },
      ],
      deliverableDependencies: [{
        _id: "prototype_finding_dep",
        inventionId: "inv_physical",
        deliverableId: "prototype_deliverable",
        dependencyType: "finding",
        dependencyId: "finding_prototype",
      }],
      evidenceFindings: [
        {
          _id: "finding_prototype",
          inventionId: "inv_physical",
          sourceIds: ["prototype_source", "design_source"],
          status: "evidence_checked",
          updatedAt: 211,
        },
        {
          _id: "finding_market",
          inventionId: "inv_physical",
          sourceIds: ["market_source"],
          status: "evidence_checked",
          updatedAt: 214,
        },
      ],
      atlasExecutionEvents: [],
    });

    await applyInventorEvidenceChange(state.ctx, "inv_physical" as any, {
      action: "removed",
      sourceId: "prototype_source" as any,
      label: "Prototype bench-test results",
      evidenceKind: "prototype_test",
      now: 300,
    });

    const byWorkId = new Map(state.tables.atlasWorkItems.map((row) => [row._id, row]));
    expect(byWorkId.get("prototype_gate")).toMatchObject({
      status: "blocked",
      attemptCount: 0,
      humanGateType: "physical_work",
      updatedAt: 300,
    });
    expect(byWorkId.get("prototype_gate")?.blockedReason).toMatch(/current physical prototype test evidence is required/i);
    expect(byWorkId.get("prototype_gate")?.outputSummary).toBeUndefined();

    for (const id of ["prototype_assessment", "rfq_package", "manufacturing_ready"]) {
      expect(byWorkId.get(id)).toMatchObject({ status: "queued", attemptCount: 0, updatedAt: 300 });
      expect(byWorkId.get(id)?.completedAt).toBeUndefined();
      expect(byWorkId.get(id)?.outputSummary).toBeUndefined();
      expect(byWorkId.get(id)?.lastError).toMatch(/Inventor evidence was removed: Prototype bench-test results/i);
    }

    expect(byWorkId.get("market_analysis")).toMatchObject({
      status: "completed",
      outputSummary: "Market analysis complete",
      updatedAt: 214,
    });
    expect(byWorkId.get("prior_art")).toMatchObject({
      status: "completed",
      outputSummary: "Prior-art review complete",
      updatedAt: 215,
    });

    const prototypeDeliverable = state.tables.atlasDeliverables.find((row) => row._id === "prototype_deliverable")!;
    expect(prototypeDeliverable.sourceIds).toEqual(["design_source"]);
    expect(prototypeDeliverable.staleReason).toMatch(/Inventor evidence was removed: Prototype bench-test results/i);
    expect(prototypeDeliverable.updatedAt).toBe(300);

    const marketDeliverable = state.tables.atlasDeliverables.find((row) => row._id === "market_deliverable")!;
    expect(marketDeliverable.sourceIds).toEqual(["market_source"]);
    expect(marketDeliverable.staleReason).toBeUndefined();
    expect(marketDeliverable.updatedAt).toBe(214);

    const prototypeFinding = state.tables.evidenceFindings.find((row) => row._id === "finding_prototype")!;
    expect(prototypeFinding).toMatchObject({ status: "stale", updatedAt: 300 });
    expect(prototypeFinding.sourceIds).toEqual(["design_source"]);

    const marketFinding = state.tables.evidenceFindings.find((row) => row._id === "finding_market")!;
    expect(marketFinding).toMatchObject({ status: "evidence_checked", updatedAt: 214 });
    expect(marketFinding.sourceIds).toEqual(["market_source"]);

    expect(state.tables.inventionRecords[0].structuredBrief.inventorEvidence).toEqual([
      expect.objectContaining({ sourceId: "market_source", evidenceKind: "interview" }),
    ]);
    expect(state.tables.inventions[0].updatedAt).toBe(300);
    expect(state.inserted).toEqual(expect.arrayContaining([
      expect.objectContaining({
        table: "atlasExecutionEvents",
        doc: expect.objectContaining({ eventType: "work_blocked", workItemId: "prototype_gate" }),
      }),
      expect.objectContaining({
        table: "atlasExecutionEvents",
        doc: expect.objectContaining({
          eventType: "invention_changed",
          metadata: expect.objectContaining({ action: "removed", evidenceKind: "prototype_test" }),
        }),
      }),
    ]));
  });
});
