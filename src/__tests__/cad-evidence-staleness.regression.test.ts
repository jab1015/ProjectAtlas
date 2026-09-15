import { describe, expect, it } from "vitest";
import { NATIVE_CAD_DELIVERABLE_KINDS } from "@convex/cadArtifactKinds";
import { applyInventorEvidenceChange } from "@convex/evidenceImpact";
import { isProductionMatureCad } from "@convex/manufacturingMaturityLogic";

type Row = Record<string, any> & { _id: string };

function fakeContext(initial: Record<string, Row[]>) {
  const tables = Object.fromEntries(
    Object.entries(initial).map(([name, rows]) => [name, rows.map((row) => structuredClone(row))])
  ) as Record<string, Row[]>;

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
      (tables[table] ??= []).push({ _id: id, ...structuredClone(doc) });
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

describe("CAD readiness after inventor-evidence removal", () => {
  it("makes a previously reviewed concrete CAD set ineligible when supporting evidence is removed", async () => {
    const cadDeliverables = NATIVE_CAD_DELIVERABLE_KINDS.map((kind, index) => ({
      _id: `cad_${index}`,
      inventionId: "inv_1",
      workItemId: "cad_work",
      kind,
      version: 1,
      trustState: "professionally_reviewed",
      artifactMaturity: "engineering_reviewed",
      sourceIds: ["source_1"],
      assumptions: [],
      limitations: [],
      updatedAt: 10,
    }));

    const { ctx, tables } = fakeContext({
      inventions: [{ _id: "inv_1", updatedAt: 10 }],
      inventionRecords: [{
        _id: "record_1",
        inventionId: "inv_1",
        structuredBrief: {
          inventorEvidence: [{ sourceId: "source_1", label: "Dimensional test results" }],
        },
        updatedAt: 10,
      }],
      atlasWorkItems: [{
        _id: "cad_work",
        inventionId: "inv_1",
        kind: "native_cad_generation",
        status: "completed",
        attemptCount: 1,
        updatedAt: 10,
      }],
      evidenceFindings: [],
      deliverableDependencies: [],
      atlasDeliverables: cadDeliverables,
      atlasExecutionEvents: [],
    });

    expect(isProductionMatureCad(cadDeliverables)).toBe(true);

    await applyInventorEvidenceChange(ctx, "inv_1" as any, {
      action: "removed",
      sourceId: "source_1" as any,
      label: "Dimensional test results",
      now: 100,
    });

    const changedCad = tables.atlasDeliverables;
    expect(changedCad).toHaveLength(NATIVE_CAD_DELIVERABLE_KINDS.length);
    for (const deliverable of changedCad) {
      expect(deliverable.sourceIds).toEqual([]);
      expect(deliverable.staleReason).toContain("Inventor evidence was removed");
    }
    expect(isProductionMatureCad(changedCad)).toBe(false);
  });
});
