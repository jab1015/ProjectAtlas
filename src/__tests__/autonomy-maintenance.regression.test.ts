import { describe, expect, it } from "vitest";
import { hasRecoverableAutonomousWork, shouldQueueEvidenceRefresh } from "@convex/autonomyMaintenanceLogic";

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
});
