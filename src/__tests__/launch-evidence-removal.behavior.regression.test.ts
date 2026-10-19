import { describe, expect, it } from "vitest";
import { applyInventorEvidenceChange } from "@convex/evidenceImpact";

type Row = Record<string, any> & { _id: string };
type Tables = Record<string, Row[]>;

function fakeContext(initial: Tables) {
  const tables: Tables = Object.fromEntries(
    Object.entries(initial).map(([name, rows]) => [name, rows.map((row) => structuredClone(row))]),
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

describe("launch evidence removal behavior", () => {
  it("re-blocks actual launch evidence and invalidates dependent post-launch conclusions", async () => {
    const { ctx, tables } = fakeContext({
      inventions: [{ _id: "inv_1", updatedAt: 10 }],
      inventionRecords: [{
        _id: "record_1",
        inventionId: "inv_1",
        structuredBrief: {
          inventorEvidence: [{
            sourceId: "sales_source",
            label: "Post-launch sales analytics",
            evidenceKind: "sales_evidence",
          }],
        },
        updatedAt: 10,
      }],
      atlasWorkItems: [
        {
          _id: "launch_gate",
          inventionId: "inv_1",
          kind: "launch_actual_evidence",
          status: "completed",
          attemptCount: 1,
          completedAt: 20,
          outputSummary: "Actual launch evidence confirmed",
          reservedCostUnits: 3,
          actualCostUnits: 2,
          updatedAt: 20,
        },
        {
          _id: "launch_performance",
          inventionId: "inv_1",
          kind: "launch_performance",
          status: "completed",
          attemptCount: 1,
          completedAt: 21,
          outputSummary: "Post-launch performance conclusions",
          dependsOnKinds: ["launch_actual_evidence"],
          updatedAt: 21,
        },
        {
          _id: "unrelated",
          inventionId: "inv_1",
          kind: "market_feasibility",
          status: "completed",
          attemptCount: 1,
          completedAt: 9,
          outputSummary: "Unrelated market work",
          updatedAt: 9,
        },
      ],
      evidenceFindings: [],
      atlasDeliverables: [],
      deliverableDependencies: [],
      atlasExecutionEvents: [],
    });

    await applyInventorEvidenceChange(ctx, "inv_1" as any, {
      action: "removed",
      sourceId: "sales_source" as any,
      label: "Post-launch sales analytics",
      evidenceKind: "sales_evidence",
      now: 700,
    });

    const launchGate = tables.atlasWorkItems.find((item) => item._id === "launch_gate")!;
    const launchPerformance = tables.atlasWorkItems.find((item) => item._id === "launch_performance")!;
    const unrelated = tables.atlasWorkItems.find((item) => item._id === "unrelated")!;

    expect(launchGate.status).toBe("blocked");
    expect(launchGate.humanGateType).toBe("private_information");
    expect(launchGate.blockedReason).toMatch(/current actual launch\/sales\/customer evidence/i);
    expect(launchGate.completedAt).toBeUndefined();
    expect(launchGate.outputSummary).toBeUndefined();
    expect(launchGate.reservedCostUnits).toBeUndefined();
    expect(launchGate.actualCostUnits).toBeUndefined();

    expect(launchPerformance.status).toBe("queued");
    expect(launchPerformance.completedAt).toBeUndefined();
    expect(launchPerformance.outputSummary).toBeUndefined();
    expect(unrelated.status).toBe("completed");

    expect(tables.inventionRecords[0].structuredBrief.inventorEvidence).toEqual([]);
    expect(tables.atlasExecutionEvents).toEqual(expect.arrayContaining([
      expect.objectContaining({
        eventType: "work_blocked",
        workItemId: "launch_gate",
        metadata: expect.objectContaining({ evidenceKind: "sales_evidence", sourceId: "sales_source" }),
      }),
    ]));
  });
});
