import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./authHelpers";
import { ensurePersonalOrganizationForUser } from "./organizations";
import {
  getActiveEntitlementOverride,
  getEffectiveOrganizationPlanKey,
  getOrganizationCreditBalance,
  recordCreditEntry,
} from "./betaAccessLogic";

const planKeyValidator = v.union(
  v.literal("explorer"),
  v.literal("inventor"),
  v.literal("pro"),
  v.literal("enterprise"),
  v.literal("studio_3"),
  v.literal("studio_6"),
  v.literal("studio_custom"),
);

function normalizeEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalized) || normalized.length > 320) {
    throw new ConvexError("Enter a valid account email address");
  }
  return normalized;
}

async function findUserByEmail(ctx: Parameters<typeof ensurePersonalOrganizationForUser>[0], email: string) {
  const matches = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).collect();
  if (matches.length !== 1) throw new ConvexError("The beta tester must create an InventSmith account first");
  return matches[0];
}

async function resolvePersonalOrganization(ctx: Parameters<typeof ensurePersonalOrganizationForUser>[0], userId: Id<"users">) {
  const organizationId = await ensurePersonalOrganizationForUser(ctx, userId);
  const organization = await ctx.db.get(organizationId);
  if (!organization) throw new ConvexError("Personal organization not found");
  return organization;
}

export const listAccounts = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    const search = args.search?.trim().toLowerCase();
    const rows = [];

    for (const user of users) {
      if (search && !(`${user.email ?? ""} ${user.name ?? ""}`).toLowerCase().includes(search)) continue;
      if (!user.email) continue;
      const organizationId = user.personalOrganizationId;
      if (!organizationId) {
        rows.push({ userId: user._id, email: user.email, name: user.name ?? "", organizationId: null, planKey: user.subscriptionTier ?? "free", override: null, creditBalance: 0 });
        continue;
      }
      const organization = await ctx.db.get(organizationId);
      if (!organization || organization.status === "closed") continue;
      const [override, creditBalance, planKey] = await Promise.all([
        getActiveEntitlementOverride(ctx, organization._id),
        getOrganizationCreditBalance(ctx, organization._id),
        getEffectiveOrganizationPlanKey(ctx, organization),
      ]);
      rows.push({
        userId: user._id,
        email: user.email,
        name: user.name ?? "",
        organizationId: organization._id,
        planKey,
        basePlanKey: organization.planKey,
        override: override ? { _id: override._id, planKey: override.planKey, startsAt: override.startsAt, expiresAt: override.expiresAt, reason: override.reason } : null,
        creditBalance,
      });
    }
    return rows.sort((a, b) => a.email.localeCompare(b.email));
  },
});

export const grantComplimentaryAccess = mutation({
  args: {
    email: v.string(),
    planKey: planKeyValidator,
    startsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    await requireAdmin(ctx);
    const email = normalizeEmail(args.email);
    const reason = args.reason.trim();
    if (!reason) throw new ConvexError("A reason is required for complimentary access");
    const startsAt = args.startsAt ?? Date.now();
    if (args.expiresAt !== undefined && args.expiresAt <= startsAt) throw new ConvexError("Access expiration must be after its start");
    const user = await findUserByEmail(ctx, email);
    const organization = await resolvePersonalOrganization(ctx, user._id);
    const now = Date.now();

    // A new grant replaces any current/future unrevoked grant for this
    // organization. Otherwise an older lifetime grant could reappear when a
    // newer temporary grant expires or is revoked.
    const existingOverrides = await ctx.db
      .query("organizationEntitlementOverrides")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organization._id))
      .collect();
    for (const existing of existingOverrides) {
      if (existing.revokedAt) continue;
      await ctx.db.patch(existing._id, {
        revokedAt: now,
        revokedByUserId: adminUserId!,
        revokedReason: `Superseded by a new access grant: ${reason}`,
      });
    }

    const overrideId = await ctx.db.insert("organizationEntitlementOverrides", {
      organizationId: organization._id,
      planKey: args.planKey,
      startsAt,
      expiresAt: args.expiresAt,
      reason,
      grantedByUserId: adminUserId!,
      createdAt: now,
    });
    return { overrideId, organizationId: organization._id, email, planKey: args.planKey, expiresAt: args.expiresAt ?? null };
  },
});

export const revokeComplimentaryAccess = mutation({
  args: { overrideId: v.id("organizationEntitlementOverrides"), reason: v.string() },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    await requireAdmin(ctx);
    const reason = args.reason.trim();
    if (!reason) throw new ConvexError("A reason is required when revoking access");
    const override = await ctx.db.get(args.overrideId);
    if (!override) throw new ConvexError("Complimentary access grant not found");
    if (override.revokedAt) return { revoked: false };
    await ctx.db.patch(args.overrideId, { revokedAt: Date.now(), revokedByUserId: adminUserId!, revokedReason: reason });
    return { revoked: true };
  },
});

export const adjustCredits = mutation({
  args: { organizationId: v.id("organizations"), deltaUnits: v.number(), reason: v.string() },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    await requireAdmin(ctx);
    const organization = await ctx.db.get(args.organizationId);
    if (!organization || organization.status !== "active") throw new ConvexError("Organization not found");
    if (!Number.isInteger(args.deltaUnits) || args.deltaUnits === 0) throw new ConvexError("Credits must be a non-zero whole number");
    const reason = args.reason.trim();
    if (!reason) throw new ConvexError("A reason is required for credit changes");
    const currentBalance = await getOrganizationCreditBalance(ctx, args.organizationId);
    if (args.deltaUnits < 0 && currentBalance + args.deltaUnits < 0) {
      throw new ConvexError("Credit adjustment cannot make the balance negative");
    }
    const ledgerId = await recordCreditEntry(ctx, {
      organizationId: args.organizationId,
      deltaUnits: args.deltaUnits,
      kind: args.deltaUnits > 0 ? "grant" : "adjustment",
      reason,
      actorUserId: adminUserId!,
    });
    return { ledgerId, balance: currentBalance + args.deltaUnits };
  },
});
