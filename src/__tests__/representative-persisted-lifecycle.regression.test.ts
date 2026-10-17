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
});
