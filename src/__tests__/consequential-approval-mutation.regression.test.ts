import { beforeEach, describe, expect, it, vi } from "vitest";

const access = vi.hoisted(() => ({
  requireInventionManageAccess: vi.fn(),
}));
vi.mock("../../convex/organizations", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../convex/organizations")>();
  return { ...actual, requireInventionManageAccess: access.requireInventionManageAccess };
});

import {
  requestApprovalHandler,
  requireCurrentApprovedExternalAction,
  resolveApprovalRequestHandler,
} from "../../convex/consequentialApprovalMutation";

type Row = Record<string, any> & { _id: string };

function buildState(input?: {
  deliverables?: Row[];
  approvals?: Row[];
  scopeEvents?: Row[];
  decisions?: Row[];
}) {
  const invention: Row = { _id: "inv1", userId: "owner1", title: "Inventor project" };
  const deliverables = input?.deliverables ?? [];
  const approvals = input?.approvals ?? [];
  const decisions = input?.decisions ?? [];
  const events = [...(input?.scopeEvents ?? [])];
  const rows = new Map<string, Row>([[invention._id, invention]]);
  for (const row of [...deliverables, ...approvals, ...decisions, ...events]) rows.set(row._id, row);

  const patches: Array<{ id: string; value: Record<string, unknown> }> = [];
  const inserts: Array<{ table: string; value: Record<string, any>; id: string }> = [];

  const ctx = {
    db: {
      get: vi.fn(async (id: string) => rows.get(String(id)) ?? null),
      query: vi.fn((table: string) => ({
        withIndex: (_index: string, apply: (q: any) => unknown) => {
          const filters: Record<string, unknown> = {};
          const q: any = {
            eq(field: string, value: unknown) {
              filters[field] = value;
              return q;
            },
          };
          apply(q);
          return {
            collect: vi.fn(async () => {
              const candidates = table === "atlasDeliverables"
                ? deliverables
                : table === "atlasExecutionEvents"
                  ? events
                  : [];
              return candidates.filter((row) =>
                Object.entries(filters).every(([field, value]) => row[field] === value)
              );
            }),
          };
        },
      })),
      patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
        patches.push({ id: String(id), value });
        const row = rows.get(String(id));
        if (row) Object.assign(row, value);
      }),
      insert: vi.fn(async (table: string, value: Record<string, any>) => {
        const id = table === "approvalRequests" ? `approval-${approvals.length + 1}` : `event-${events.length + 1}`;
        inserts.push({ table, value, id });
        const row = { _id: id, ...value };
        rows.set(id, row);
        if (table === "approvalRequests") approvals.push(row);
        if (table === "atlasExecutionEvents") events.push(row);
        return id;
      }),
    },
  } as any;

  return { ctx, invention, deliverables, approvals, events, patches, inserts };
}

function artifact(overrides: Record<string, unknown> = {}): Row {
  return {
    _id: "del1",
    inventionId: "inv1",
    kind: "manufacturer_rfq_package",
    version: 2,
    trustState: "ready_for_authorized_use",
    ...overrides,
  };
}

function approval(overrides: Record<string, unknown> = {}): Row {
  return {
    _id: "approval-1",
    inventionId: "inv1",
    actionType: "contact_third_party",
    summary: "Contact a manufacturer using the approved RFQ package.",
    consequences: ["Shares the selected RFQ package with an external manufacturer."],
    status: "pending",
    requestedAt: 1,
    ...overrides,
  };
}

function scopeEvent(deliverableIds = ["del1"], overrides: Record<string, unknown> = {}): Row {
  return {
    _id: "scope-1",
    inventionId: "inv1",
    eventType: "invention_changed",
    actorType: "system",
    summary: "Bound consequential approval to exact authorized artifact revisions.",
    metadata: {
      changeType: "approval_artifact_scope",
      approvalRequestId: "approval-1",
      actionType: "contact_third_party",
      deliverableIds,
    },
    createdAt: 1,
    ...overrides,
  };
}

describe("consequential approval artifact binding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    access.requireInventionManageAccess.mockResolvedValue({ userId: "owner1", access: "manage" });
  });

  it("creates a third-party contact request only when bound to a current authorized revision", async () => {
    const current = artifact();
    const state = buildState({ deliverables: [current] });

    const id = await requestApprovalHandler(state.ctx, {
      inventionId: "inv1" as any,
      deliverableIds: ["del1" as any],
      actionType: "contact_third_party",
      summary: "Contact manufacturer",
      consequences: ["Discloses the RFQ to the selected manufacturer."],
    });

    expect(id).toBe("approval-1");
    expect(state.inserts).toHaveLength(2);
    expect(state.inserts[0]).toMatchObject({ table: "approvalRequests", value: { status: "pending", actionType: "contact_third_party" } });
    expect(state.inserts[1]).toMatchObject({
      table: "atlasExecutionEvents",
      value: { metadata: { changeType: "approval_artifact_scope", approvalRequestId: "approval-1", actionType: "contact_third_party", deliverableIds: ["del1"] } },
    });
  });

  it.each(["share_confidential_information", "contact_third_party", "publish_or_disclose", "submit_or_file", "external_use"] as const)(
    "rejects %s without exact artifact scope and creates no request",
    async (actionType) => {
      const state = buildState();
      await expect(requestApprovalHandler(state.ctx, {
        inventionId: "inv1" as any,
        actionType,
        summary: "External operation",
        consequences: [],
      })).rejects.toThrow(/bound to at least one exact authorized artifact revision/i);
      expect(state.inserts).toHaveLength(0);
    },
  );

  it("rejects stale, unauthorized, superseded, duplicate-latest, and wrong-invention artifacts before creating a request", async () => {
    const cases: Row[][] = [
      [artifact({ staleReason: "Evidence changed" })],
      [artifact({ trustState: "professionally_reviewed" })],
      [artifact({ version: 1 }), artifact({ _id: "del2", version: 2 })],
      [artifact(), artifact({ _id: "del2" })],
      [artifact({ inventionId: "inv-other" })],
    ];

    for (const deliverables of cases) {
      const state = buildState({ deliverables });
      await expect(requestApprovalHandler(state.ctx, {
        inventionId: "inv1" as any,
        deliverableIds: ["del1" as any],
        actionType: "contact_third_party",
        summary: "Contact manufacturer",
        consequences: [],
      })).rejects.toThrow();
      expect(state.inserts).toHaveLength(0);
    }
  });

  it("revalidates the exact artifact when a manager approves and records the bound scope", async () => {
    const state = buildState({
      deliverables: [artifact()],
      approvals: [approval()],
      scopeEvents: [scopeEvent()],
    });

    await expect(resolveApprovalRequestHandler(state.ctx, {
      approvalRequestId: "approval-1" as any,
      approved: true,
    })).resolves.toEqual({ success: true });

    expect(access.requireInventionManageAccess).toHaveBeenCalledWith(state.ctx, "inv1");
    expect(state.patches).toHaveLength(1);
    expect(state.patches[0]).toMatchObject({ id: "approval-1", value: { status: "approved", resolvedByUserId: "owner1" } });
    expect(state.inserts.at(-1)).toMatchObject({
      table: "atlasExecutionEvents",
      value: { eventType: "approval_resolved", metadata: { actionType: "contact_third_party", deliverableIds: ["del1"], approved: true } },
    });
  });

  it("rejects approval when a scoped artifact became stale or superseded after the request, with no resolution side effects", async () => {
    for (const deliverables of [
      [artifact({ staleReason: "New evidence invalidated this RFQ." })],
      [artifact({ version: 1 }), artifact({ _id: "del2", version: 2 })],
    ]) {
      const state = buildState({ deliverables, approvals: [approval()], scopeEvents: [scopeEvent()] });
      await expect(resolveApprovalRequestHandler(state.ctx, {
        approvalRequestId: "approval-1" as any,
        approved: true,
      })).rejects.toThrow();
      expect(state.patches).toHaveLength(0);
      expect(state.inserts).toHaveLength(0);
    }
  });

  it("fails closed when an old external approval has no artifact-scope audit record", async () => {
    const state = buildState({ deliverables: [artifact()], approvals: [approval()] });
    await expect(resolveApprovalRequestHandler(state.ctx, {
      approvalRequestId: "approval-1" as any,
      approved: true,
    })).rejects.toThrow(/missing its exact authorized artifact scope/i);
    expect(state.patches).toHaveLength(0);
    expect(state.inserts).toHaveLength(0);
  });

  it("still lets an authorized manager decline a legacy unscoped external request", async () => {
    const state = buildState({ approvals: [approval()] });
    await expect(resolveApprovalRequestHandler(state.ctx, {
      approvalRequestId: "approval-1" as any,
      approved: false,
    })).resolves.toEqual({ success: true });
    expect(state.patches[0]).toMatchObject({ id: "approval-1", value: { status: "denied" } });
  });

  it("rejects resolution before writes when manager authorization fails", async () => {
    access.requireInventionManageAccess.mockRejectedValueOnce(new Error("Invention management access required"));
    const state = buildState({ deliverables: [artifact()], approvals: [approval()], scopeEvents: [scopeEvent()] });
    await expect(resolveApprovalRequestHandler(state.ctx, {
      approvalRequestId: "approval-1" as any,
      approved: true,
    })).rejects.toThrow(/management access/i);
    expect(state.patches).toHaveLength(0);
    expect(state.inserts).toHaveLength(0);
  });

  it("allows payment approval without artifact disclosure scope", async () => {
    const state = buildState();
    await expect(requestApprovalHandler(state.ctx, {
      inventionId: "inv1" as any,
      actionType: "purchase_or_fee",
      summary: "Pay a filing fee",
      consequences: ["Creates a financial commitment."],
    })).resolves.toBe("approval-1");
    expect(state.inserts).toHaveLength(1);
    expect(state.inserts[0].table).toBe("approvalRequests");
  });

  it("execution guard rejects stale approval scope even after the request status is approved", async () => {
    const approved = approval({ status: "approved" });
    const state = buildState({ deliverables: [artifact({ staleReason: "Superseded evidence" })], approvals: [approved], scopeEvents: [scopeEvent()] });
    await expect(requireCurrentApprovedExternalAction(state.ctx, "approval-1" as any, "contact_third_party")).rejects.toThrow(/stale/i);
  });
});
