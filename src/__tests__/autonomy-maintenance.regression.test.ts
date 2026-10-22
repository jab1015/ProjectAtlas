import { describe, expect, it, vi } from "vitest";
import { hasRecoverableAutonomousWork, shouldQueueEvidenceRefresh } from "@convex/autonomyMaintenanceLogic";
import { recoverFailedWork } from "@convex/autonomyMaintenance";

describe("unattended autonomy recovery", () => {
  it("resumes queued work and expired leases without touching healthy or human-blocked work", () => {
    expect(hasRecoverableAutonomousWork([{ status: "queued" }], 100)).toBe(true);
    expect(hasRecoverableAutonomousWork([{ status: "running", leaseExpiresAt: 99 }], 100)).toBe(true);
    expect(hasRecoverableAutonomousWork([{ status: "running", leaseExpiresAt: 101 }], 100)).toBe(false);
    expect(hasRecoverableAutonomousWork([{ status: "blocked" }, { status: "completed" }], 100)).toBe(false);
  });

  it("queues an expired-evidence refresh once without disrupting active verification", () => {
    expect(shouldQueueEvidenceRefresh("completed")).toBe(true);
    expect(shouldQueueEvidenceRefresh("failed")).toBe(true);
    expect(shouldQueueEvidenceRefresh("queued")).toBe(false);
    expect(shouldQueueEvidenceRefresh("running")).toBe(false);
    expect(shouldQueueEvidenceRefresh(undefined)).toBe(false);
  });

  it("automatically requeues an exhausted autonomous task within the two-cycle recovery bound", async () => {
    const item = {
      _id: "work-1", inventionId: "inv-1", title: "Research materials and manufacturing approaches",
      kind: "materials_manufacturing", status: "failed", attemptCount: 7, maxAttempts: 5,
      inputSnapshot: { product: "RiseJars", department: "manufacturing", automaticRecoveryCount: 0 },
    };
    const patch = vi.fn();
    const insert = vi.fn();
    const ctx = {
      db: {
        query: (table: string) => ({
          withIndex: () => table === "inventions"
            ? { take: async () => [{ _id: "inv-1", status: "active" }] }
            : { collect: async () => [item] },
        }),
        patch,
        insert,
      },
    } as any;

    const result = await (recoverFailedWork as any)._handler(ctx, {});
    expect(result).toEqual({ requeued: 1 });
    expect(patch).toHaveBeenCalledWith("work-1", expect.objectContaining({
      status: "queued", maxAttempts: 9,
      inputSnapshot: expect.objectContaining({ automaticRecoveryCount: 1, department: "manufacturing" }),
    }));
    expect(insert).toHaveBeenCalledWith("atlasExecutionEvents", expect.objectContaining({
      actorType: "system", metadata: expect.objectContaining({ changeType: "automatic_failure_recovery" }),
    }));
  });

  it("stops automatic recovery after its configured bound", async () => {
    const item = {
      _id: "work-1", inventionId: "inv-1", title: "Research materials", kind: "materials_manufacturing",
      status: "failed", attemptCount: 9, maxAttempts: 9,
      inputSnapshot: { product: "RiseJars", department: "manufacturing", automaticRecoveryCount: 2 },
    };
    const patch = vi.fn();
    const insert = vi.fn();
    const ctx = {
      db: {
        query: (table: string) => ({
          withIndex: () => table === "inventions"
            ? { take: async () => [{ _id: "inv-1", status: "active" }] }
            : { collect: async () => [item] },
        }),
        patch,
        insert,
      },
    } as any;

    const result = await (recoverFailedWork as any)._handler(ctx, {});
    expect(result).toEqual({ requeued: 0 });
    expect(patch).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });
});
