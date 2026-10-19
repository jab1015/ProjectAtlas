import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { OrganizationPlanKey } from "./organizationPolicyLogic";

type AccessCtx = QueryCtx | MutationCtx;

export async function getActiveEntitlementOverride(
  ctx: AccessCtx,
  organizationId: Id<"organizations">,
  now = Date.now(),
): Promise<Doc<"organizationEntitlementOverrides"> | null> {
  const overrides = await ctx.db
    .query("organizationEntitlementOverrides")
    .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
    .collect();

  return overrides
    .filter((override) =>
      !override.revokedAt &&
      override.startsAt <= now &&
      (override.expiresAt === undefined || override.expiresAt > now)
    )
    .sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
}

export async function getEffectiveOrganizationPlanKey(
  ctx: AccessCtx,
  organization: Doc<"organizations">,
  now = Date.now(),
): Promise<OrganizationPlanKey> {
  const override = await getActiveEntitlementOverride(ctx, organization._id, now);
  return override?.planKey ?? organization.planKey;
}

export async function getOrganizationCreditBalance(
  ctx: AccessCtx,
  organizationId: Id<"organizations">,
): Promise<number> {
  const entries = await ctx.db
    .query("organizationCreditLedger")
    .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
    .collect();
  return entries.reduce((balance, entry) => balance + entry.deltaUnits, 0);
}

export async function recordCreditEntry(
  ctx: MutationCtx,
  args: {
    organizationId: Id<"organizations">;
    deltaUnits: number;
    kind: "grant" | "debit" | "refund" | "adjustment";
    reason: string;
    actorUserId?: Id<"users">;
    referenceId?: string;
    createdAt?: number;
  },
) {
  if (!Number.isInteger(args.deltaUnits) || args.deltaUnits === 0) {
    throw new Error("Credit entries must be non-zero whole units");
  }
  return ctx.db.insert("organizationCreditLedger", {
    ...args,
    createdAt: args.createdAt ?? Date.now(),
  });
}
