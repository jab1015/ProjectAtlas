import { query } from "./_generated/server";
import { requireAdmin } from "./authHelpers";
import { classifyWorkHealth, operationalSeverity } from "./operationalHealthLogic";

export const getSnapshot = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const [failed, blocked, awaitingApproval, running, usage] = await Promise.all([
      ctx.db.query("atlasWorkItems").withIndex("by_status_priority", (q) => q.eq("status", "failed")).take(50),
      ctx.db.query("atlasWorkItems").withIndex("by_status_priority", (q) => q.eq("status", "blocked")).take(50),
      ctx.db.query("atlasWorkItems").withIndex("by_status_priority", (q) => q.eq("status", "awaiting_approval")).take(50),
      ctx.db.query("atlasWorkItems").withIndex("by_status_priority", (q) => q.eq("status", "running")).take(100),
      ctx.db.query("atlasDailyUsage").order("desc").take(100),
    ]);
    const candidates = [...failed, ...blocked, ...awaitingApproval, ...running]
      .map((item) => ({ item, health: classifyWorkHealth(item, now) }))
      .filter(({ health }) => health !== "healthy")
      .sort((a, b) => operationalSeverity(a.health) - operationalSeverity(b.health) || a.item.updatedAt - b.item.updatedAt)
      .slice(0, 100);
    const inventionIds = [...new Set(candidates.map(({ item }) => String(item.inventionId)))];
    const inventions = await Promise.all(candidates.map(({ item }) => ctx.db.get(item.inventionId)));
    const titles = new Map(inventions.filter(Boolean).map((item) => [String(item!._id), item!.title]));
    const issues = candidates.map(({ item, health }) => ({
      _id: item._id,
      inventionId: item.inventionId,
      inventionTitle: titles.get(String(item.inventionId)) ?? "Deleted invention",
      title: item.title,
      kind: item.kind,
      health,
      blockedReason: item.blockedReason,
      lastError: item.lastError,
      attemptCount: item.attemptCount,
      leaseExpiresAt: item.leaseExpiresAt,
      updatedAt: item.updatedAt,
    }));
    const today = new Date(now).toISOString().slice(0, 10);
    const todayUsage = usage.filter((row) => row.dateKey === today);
    return {
      generatedAt: now,
      counts: {
        failed: issues.filter((item) => item.health === "failed").length,
        expired: issues.filter((item) => item.health === "expired").length,
        blocked: issues.filter((item) => item.health === "blocked").length,
        reservedCostUnits: todayUsage.reduce((total, row) => total + (row.reservedAutonomousCostUnits ?? 0), 0),
        usedCostUnits: todayUsage.reduce((total, row) => total + row.autonomousCostUnits, 0),
      },
      issues,
      scannedInventionCount: inventionIds.length,
      truncated: failed.length === 50 || blocked.length === 50 || awaitingApproval.length === 50 || running.length === 100,
    };
  },
});
