import { describe, expect, it } from "vitest";
import { applyInventorEvidenceChange } from "@convex/evidenceImpact";

type Row = Record<string, any> & { _id: string };
type Tables = Record<string, Row[]>;

function fakeContext(initial: Tables) {
  const tables: Tables = Object.fromEntries(
    Object.entries(initial).map(([name, rows]) => [name, rows.map((row) => structuredClone(row))])
  );

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
      return id;
    },
    query: (table: string) => ({
      withIndex: (_index: string, _callback: unknown) => ({
        unique: async () => (tables[table] ?? [])[0] ?? null,
        collect: async () => tables[table] ?? [],
      }),
    }),
  };

  return { ctx: { db } as any, tables };
}

function blockedGate(kind: string, id: string): Row {
  return {
    _id: id,
    inventionId: "inv_1",
    kind,
    status: "blocked",
    attemptCount: 2,
    blockedReason: "External evidence required.",
    humanGateType: "authorization",
    reservedCostUnits: 4,
    actualCostUnits: 2,
    updatedAt: 10,
  };
}

function baseTables(workItems: Row[]): Tables {
  return {
    inventions: [{ _id: "inv_1", updatedAt: 10 }],
    inventionRecords: [{ _id: "record_1", inventionId: "inv_1", structuredBrief: {}, updatedAt: 10 }],
    atlasWorkItems: workItems,
    evidenceFindings: [],
    atlasDeliverables: [],
    atlasExecutionEvents: [],
  };
}

describe("real-world evidence gate behavior", () => {
  it("releases only the manufacturer quote gate for uploaded real quote/RFQ evidence", async () => {
    const { ctx, tables } = fakeContext(baseTables([
      blockedGate("manufacturer_quote_evidence", "quote_gate"),
      blockedGate("launch_actual_evidence", "launch_gate"),
    ]));

    await applyInventorEvidenceChange(ctx, "inv_1" as any, {
      action: "uploaded",
      sourceId: "quote_source" as any,
      label: "Factory RFQ response",
      evidenceKind: "manufacturer_quote",
      extraction: { supplier: "Example Factory", quotedScope: "Current revision" },
      now: 100,
    });

    const quoteGate = tables.atlasWorkItems.find((item) => item._id === "quote_gate")!;
    const launchGate = tables.atlasWorkItems.find((item) => item._id === "launch_gate")!;

    expect(quoteGate.status).toBe("queued");
    expect(quoteGate.attemptCount).toBe(0);
    expect(quoteGate.blockedReason).toBeUndefined();
    expect(quoteGate.humanGateType).toBeUndefined();
    expect(quoteGate.reservedCostUnits).toBeUndefined();
    expect(quoteGate.actualCostUnits).toBeUndefined();
    expect(quoteGate.lastError).toMatch(/quote\/RFQ evidence was supplied/i);
    expect(launchGate.status).toBe("blocked");

    expect(tables.atlasExecutionEvents).toEqual(expect.arrayContaining([
      expect.objectContaining({
        eventType: "work_queued",
        workItemId: "quote_gate",
        metadata: expect.objectContaining({ evidenceKind: "manufacturer_quote", sourceId: "quote_source" }),
      }),
    ]));
  });

  it("releases only the launch gate for uploaded actual sales/launch evidence", async () => {
    const { ctx, tables } = fakeContext(baseTables([
      blockedGate("launch_actual_evidence", "launch_gate"),
      blockedGate("manufacturer_quote_evidence", "quote_gate"),
    ]));

    await applyInventorEvidenceChange(ctx, "inv_1" as any, {
      action: "uploaded",
      sourceId: "sales_source" as any,
      label: "Post-launch sales analytics",
      evidenceKind: "sales_evidence",
      extraction: { orders: 14, period: "first week" },
      now: 200,
    });

    const launchGate = tables.atlasWorkItems.find((item) => item._id === "launch_gate")!;
    const quoteGate = tables.atlasWorkItems.find((item) => item._id === "quote_gate")!;

    expect(launchGate.status).toBe("queued");
    expect(launchGate.attemptCount).toBe(0);
    expect(launchGate.blockedReason).toBeUndefined();
    expect(launchGate.humanGateType).toBeUndefined();
    expect(launchGate.lastError).toMatch(/sales\/launch evidence was supplied/i);
    expect(quoteGate.status).toBe("blocked");
  });

  it("does not release an external gate for removed or mismatched evidence", async () => {
    const removed = fakeContext(baseTables([blockedGate("manufacturer_quote_evidence", "quote_gate")]));
    await applyInventorEvidenceChange(removed.ctx, "inv_1" as any, {
      action: "removed",
      sourceId: "quote_source" as any,
      label: "Factory RFQ response",
      evidenceKind: "manufacturer_quote",
      now: 300,
    });
    expect(removed.tables.atlasWorkItems[0].status).toBe("blocked");

    const mismatched = fakeContext(baseTables([blockedGate("launch_actual_evidence", "launch_gate")]));
    await applyInventorEvidenceChange(mismatched.ctx, "inv_1" as any, {
      action: "uploaded",
      sourceId: "quote_source" as any,
      label: "Factory RFQ response",
      evidenceKind: "manufacturer_quote",
      now: 400,
    });
    expect(mismatched.tables.atlasWorkItems[0].status).toBe("blocked");
  });
});
