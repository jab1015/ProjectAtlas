import { describe, expect, it } from "vitest";
import { applyInventorEvidenceChange } from "@convex/evidenceImpact";

type Row = Record<string, any> & { _id: string };

type Tables = Record<string, Row[]>;

function fakeContext(initial: Tables) {
  const tables: Tables = Object.fromEntries(
    Object.entries(initial).map(([name, rows]) => [name, rows.map((row) => structuredClone(row))])
  );
  const inserts: Array<{ table: string; doc: Record<string, unknown> }> = [];

  const findRow = (id: string) => {
    for (const rows of Object.values(tables)) {
      const row = rows.find((candidate) => candidate._id === id);
      if (row) return row;
    }
    return null;
  };

  const db = {
    get: async (id: string) => findRow(id),
    patch: async (id: string, patch: Record<string, unknown>) => {
      const row = findRow(id);
      if (!row) throw new Error(`Missing fake row ${id}`);
      Object.assign(row, patch);
    },
    insert: async (table: string, doc: Record<string, unknown>) => {
      const id = `${table}_${(tables[table]?.length ?? 0) + 1}`;
      const row = { _id: id, ...structuredClone(doc) } as Row;
      (tables[table] ??= []).push(row);
      inserts.push({ table, doc: structuredClone(doc) });
      return id;
    },
    query: (table: string) => ({
      withIndex: (_index: string, _callback: unknown) => ({
        unique: async () => {
          const rows = tables[table] ?? [];
          return rows.length === 1 ? rows[0] : rows[0] ?? null;
        },
        collect: async () => tables[table] ?? [],
      }),
    }),
  };

  return { ctx: { db } as any, tables, inserts };
}

describe("inventor evidence impact behavior", () => {
  it("records extracted evidence, releases the matching real-world gate, and invalidates only its downstream outputs", async () => {
    const { ctx, tables, inserts } = fakeContext({
      inventions: [{ _id: "inv_1", updatedAt: 10 }],
      inventionRecords: [{
        _id: "record_1",
        inventionId: "inv_1",
        structuredBrief: {
          inventorEvidence: [{ sourceId: "old_source", label: "Older interview" }],
        },
        updatedAt: 10,
      }],
      atlasWorkItems: [
        {
          _id: "work_gate",
          inventionId: "inv_1",
          kind: "prototype_physical_evidence",
          status: "blocked",
          attemptCount: 2,
          blockedReason: "Real prototype evidence required.",
          humanGateType: "physical_work",
          reservedCostUnits: 4,
          actualCostUnits: 2,
          updatedAt: 10,
        },
        {
          _id: "work_market",
          inventionId: "inv_1",
          kind: "market_analysis",
          status: "completed",
          attemptCount: 1,
          completedAt: 20,
          outputSummary: "Old market analysis",
          actualCostUnits: 3,
          updatedAt: 20,
        },
        {
          _id: "work_running",
          inventionId: "inv_1",
          kind: "pricing_strategy",
          status: "running",
          attemptCount: 1,
          updatedAt: 25,
        },
        {
          _id: "work_idea",
          inventionId: "inv_1",
          kind: "idea_capture",
          status: "completed",
          attemptCount: 1,
          updatedAt: 5,
        },
      ],
      evidenceFindings: [{
        _id: "finding_1",
        inventionId: "inv_1",
        sourceIds: ["source_1", "other_source"],
        status: "evidence_checked",
        updatedAt: 20,
      }],
      deliverableDependencies: [],
      atlasDeliverables: [{
        _id: "deliverable_1",
        inventionId: "inv_1",
        sourceIds: ["source_1", "other_source"],
        staleReason: undefined,
        updatedAt: 20,
      }],
      atlasExecutionEvents: [],
    });

    await applyInventorEvidenceChange(ctx, "inv_1" as any, {
      action: "uploaded",
      sourceId: "source_1" as any,
      label: "Physical prototype test results",
      evidenceKind: "prototype_test",
      extraction: {
        methodology: "bench test",
        sampleSize: 3,
        summary: "Three prototype runs completed.",
      },
      now: 100,
    });

    expect(tables.inventions[0].updatedAt).toBe(100);

    const recordedEvidence = tables.inventionRecords[0].structuredBrief.inventorEvidence;
    expect(recordedEvidence).toEqual(expect.arrayContaining([
      expect.objectContaining({ sourceId: "old_source", label: "Older interview" }),
      expect.objectContaining({
        sourceId: "source_1",
        label: "Physical prototype test results",
        evidenceKind: "prototype_test",
        provenance: "inventor_upload",
        extraction: expect.objectContaining({ methodology: "bench test", sampleSize: 3 }),
        recordedAt: 100,
      }),
    ]));
    expect(tables.inventionRecords[0].structuredBrief.inventorEvidenceLastChangedAt).toBe(100);

    const gate = tables.atlasWorkItems.find((item) => item._id === "work_gate")!;
    expect(gate.status).toBe("queued");
    expect(gate.attemptCount).toBe(0);
    expect(gate.blockedReason).toBeUndefined();
    expect(gate.humanGateType).toBeUndefined();
    expect(gate.reservedCostUnits).toBeUndefined();
    expect(gate.actualCostUnits).toBeUndefined();
    expect(gate.lastError).toContain("Prototype evidence was supplied");

    const unrelatedMarket = tables.atlasWorkItems.find((item) => item._id === "work_market")!;
    expect(unrelatedMarket.status).toBe("completed");
    expect(unrelatedMarket.outputSummary).toBe("Old market analysis");

    expect(tables.atlasWorkItems.find((item) => item._id === "work_running")!.status).toBe("running");
    expect(tables.atlasWorkItems.find((item) => item._id === "work_idea")!.status).toBe("completed");

    // The finding/deliverable are not linked to the prototype work graph in this fixture,
    // so a scoped upload must leave them current and preserve their source references.
    expect(tables.evidenceFindings[0].status).toBe("evidence_checked");
    expect(tables.evidenceFindings[0].sourceIds).toEqual(["source_1", "other_source"]);
    expect(tables.atlasDeliverables[0].sourceIds).toEqual(["source_1", "other_source"]);
    expect(tables.atlasDeliverables[0].staleReason).toBeUndefined();

    expect(inserts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        table: "atlasExecutionEvents",
        doc: expect.objectContaining({ eventType: "work_queued", workItemId: "work_gate" }),
      }),
      expect.objectContaining({
        table: "atlasExecutionEvents",
        doc: expect.objectContaining({
          eventType: "invention_changed",
          metadata: expect.objectContaining({
            changeType: "inventor_evidence",
            action: "uploaded",
            evidenceKind: "prototype_test",
            structuredExtractionAvailable: true,
          }),
        }),
      }),
    ]));
  });

  it("does not release a blocked real-world gate when unrelated evidence is uploaded", async () => {
    const { ctx, tables } = fakeContext({
      inventions: [{ _id: "inv_2", updatedAt: 10 }],
      inventionRecords: [{ _id: "record_2", inventionId: "inv_2", structuredBrief: {}, updatedAt: 10 }],
      atlasWorkItems: [{
        _id: "work_quote_gate",
        inventionId: "inv_2",
        kind: "manufacturer_quote_evidence",
        status: "blocked",
        attemptCount: 1,
        blockedReason: "Real manufacturer quote required.",
        humanGateType: "physical_work",
        updatedAt: 10,
      }],
      evidenceFindings: [],
      atlasDeliverables: [],
      deliverableDependencies: [],
      atlasExecutionEvents: [],
    });

    await applyInventorEvidenceChange(ctx, "inv_2" as any, {
      action: "uploaded",
      sourceId: "source_interview" as any,
      label: "Customer interview",
      evidenceKind: "interview",
      extraction: { summary: "Interview notes" },
      now: 200,
    });

    const quoteGate = tables.atlasWorkItems[0];
    expect(quoteGate.status).toBe("blocked");
    expect(quoteGate.blockedReason).toBe("Real manufacturer quote required.");
  });

  it("releases the manufacturer quote gate only for uploaded quote evidence and re-blocks it when that evidence is removed", async () => {
    const { ctx, tables, inserts } = fakeContext({
      inventions: [{ _id: "inv_3", updatedAt: 10 }],
      inventionRecords: [{ _id: "record_3", inventionId: "inv_3", structuredBrief: {}, updatedAt: 10 }],
      atlasWorkItems: [{
        _id: "work_quote_gate",
        inventionId: "inv_3",
        kind: "manufacturer_quote_evidence",
        status: "blocked",
        attemptCount: 2,
        completedAt: undefined,
        blockedReason: "A current real manufacturer quote/RFQ response is required.",
        humanGateType: "authorization",
        reservedCostUnits: 5,
        actualCostUnits: 3,
        updatedAt: 10,
      }],
      evidenceFindings: [],
      atlasDeliverables: [],
      deliverableDependencies: [],
      atlasExecutionEvents: [],
    });

    await applyInventorEvidenceChange(ctx, "inv_3" as any, {
      action: "uploaded",
      sourceId: "quote_source" as any,
      label: "Manufacturer RFQ response",
      evidenceKind: "manufacturer_quote",
      extraction: {
        supplier: "Fixture Manufacturer",
        quotedAt: "2026-09-15",
        notes: "Fixture evidence only; no supplier was contacted by InventSmith.",
      },
      now: 300,
    });

    const quoteGate = tables.atlasWorkItems[0];
    expect(quoteGate.status).toBe("queued");
    expect(quoteGate.attemptCount).toBe(0);
    expect(quoteGate.blockedReason).toBeUndefined();
    expect(quoteGate.humanGateType).toBeUndefined();
    expect(quoteGate.reservedCostUnits).toBeUndefined();
    expect(quoteGate.actualCostUnits).toBeUndefined();
    expect(quoteGate.lastError).toMatch(/manufacturer quote\/RFQ evidence was supplied/i);
    expect(tables.inventionRecords[0].structuredBrief.inventorEvidence).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sourceId: "quote_source",
        evidenceKind: "manufacturer_quote",
        provenance: "inventor_upload",
      }),
    ]));
    expect(inserts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        table: "atlasExecutionEvents",
        doc: expect.objectContaining({
          eventType: "work_queued",
          workItemId: "work_quote_gate",
          summary: expect.stringMatching(/released the manufacturer quote-evidence gate/i),
        }),
      }),
    ]));

    await applyInventorEvidenceChange(ctx, "inv_3" as any, {
      action: "removed",
      sourceId: "quote_source" as any,
      label: "Manufacturer RFQ response",
      evidenceKind: "manufacturer_quote",
      now: 400,
    });

    expect(quoteGate.status).toBe("blocked");
    expect(quoteGate.humanGateType).toBe("authorization");
    expect(quoteGate.blockedReason).toMatch(/current real manufacturer quote\/RFQ response is required/i);
    expect(quoteGate.lastError).toMatch(/evidence was removed/i);
    expect(tables.inventionRecords[0].structuredBrief.inventorEvidence).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ sourceId: "quote_source" }),
    ]));
    expect(inserts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        table: "atlasExecutionEvents",
        doc: expect.objectContaining({
          eventType: "work_blocked",
          workItemId: "work_quote_gate",
          summary: expect.stringMatching(/blocked the manufacturer quote-evidence gate/i),
        }),
      }),
    ]));
  });
});
