import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn(async () => ({ userId: "admin-user" }));
const deleteAccountData = vi.fn();

vi.mock("../../convex/authHelpers", () => ({ requireAdmin }));
vi.mock("../../convex/accountDeletion", () => ({ deleteAccountData }));

import {
  executeAccountDeletionHandler,
  resolvePrivacyRequestHandler,
} from "../../convex/privacyRequests";

type Row = Record<string, any> & { _id: string };

function buildCtx(rows: Row[]) {
  const byId = new Map(rows.map((row) => [row._id, row]));
  const patches: Array<{ id: string; value: Record<string, unknown> }> = [];
  return {
    ctx: {
      db: {
        get: vi.fn(async (id: string) => byId.get(String(id)) ?? null),
        patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
          patches.push({ id: String(id), value });
        }),
      },
    } as any,
    patches,
  };
}

describe("privacy request execution behavior", () => {
  beforeEach(() => {
    requireAdmin.mockClear();
    deleteAccountData.mockReset();
  });

  it("refuses to complete an account-deletion request through generic resolution with zero writes", async () => {
    const state = buildCtx([{ _id: "req-1", requestType: "account_deletion", status: "pending" }]);

    await expect(resolvePrivacyRequestHandler(state.ctx, {
      requestId: "req-1",
      status: "completed",
      resolutionNotes: "Deletion was reviewed and completed.",
    })).rejects.toThrow(/must be completed through executeAccountDeletion/i);

    expect(requireAdmin).toHaveBeenCalledTimes(1);
    expect(state.patches).toEqual([]);
  });

  it("requires auditable notes before a terminal generic resolution and performs zero writes", async () => {
    const state = buildCtx([{ _id: "req-2", requestType: "data_export", status: "pending" }]);

    await expect(resolvePrivacyRequestHandler(state.ctx, {
      requestId: "req-2",
      status: "declined",
      resolutionNotes: "too short",
    })).rejects.toThrow(/requires auditable resolution notes/i);

    expect(state.patches).toEqual([]);
  });

  it("rejects a terminal deletion request before deletion or status mutation", async () => {
    const state = buildCtx([
      { _id: "req-3", requestType: "account_deletion", status: "completed", userId: "user-3" },
      { _id: "user-3", role: "user" },
    ]);

    await expect(executeAccountDeletionHandler(state.ctx, {
      requestId: "req-3",
      externalBillingResolved: true,
      resolutionNotes: "Audited deletion resolution notes.",
    })).rejects.toThrow(/already terminal/i);

    expect(deleteAccountData).not.toHaveBeenCalled();
    expect(state.patches).toEqual([]);
  });

  it("blocks administrator-account deletion before destructive execution or request mutation", async () => {
    const state = buildCtx([
      { _id: "req-4", requestType: "account_deletion", status: "pending", userId: "user-admin" },
      { _id: "user-admin", role: "admin" },
    ]);

    await expect(executeAccountDeletionHandler(state.ctx, {
      requestId: "req-4",
      externalBillingResolved: true,
      resolutionNotes: "Audited administrator deletion attempt.",
    })).rejects.toThrow(/Administrator accounts cannot be deleted/i);

    expect(deleteAccountData).not.toHaveBeenCalled();
    expect(state.patches).toEqual([]);
  });

  it("moves the request in-progress before deletion and completes it only after deletion succeeds", async () => {
    const state = buildCtx([
      { _id: "req-5", requestType: "account_deletion", status: "pending", userId: "user-5" },
      { _id: "user-5", role: "user", subscriptionTier: "free", subscriptionStatus: "inactive" },
    ]);
    deleteAccountData.mockResolvedValue({ deletedRows: 12 });

    const result = await executeAccountDeletionHandler(state.ctx, {
      requestId: "req-5",
      externalBillingResolved: false,
      resolutionNotes: "Audited deletion approved for execution.",
    });

    expect(result).toEqual({ success: true, summary: { deletedRows: 12 } });
    expect(deleteAccountData).toHaveBeenCalledTimes(1);
    expect(deleteAccountData).toHaveBeenCalledWith(state.ctx, "user-5");
    expect(state.patches).toHaveLength(2);
    expect(state.patches[0]).toMatchObject({ id: "req-5", value: { status: "in_progress" } });
    expect(state.patches[1].id).toBe("req-5");
    expect(state.patches[1].value).toMatchObject({ status: "completed" });
    expect(String(state.patches[1].value.resolutionNotes)).toContain("Deletion summary");
  });
});
