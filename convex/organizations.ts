import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  canEditInvention,
  canManageInventionAccess,
  canManageOrganization,
  defaultInventionAccessForRole,
  normalizeOrganizationPlanKey,
  type InventionAccess,
  type OrganizationRole,
} from "./organizationPolicyLogic";

type AuthCtx = QueryCtx | MutationCtx;

async function requireUserId(ctx: AuthCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Authentication required");
  return userId;
}

function personalOrganizationName(name?: string, email?: string): string {
  const trimmed = name?.trim();
  if (trimmed) return `${trimmed}'s InventSmith`;
  const local = email?.split("@")[0]?.trim();
  if (local) return `${local}'s InventSmith`;
  return "My InventSmith";
}

export async function getOrganizationMembership(
  ctx: AuthCtx,
  organizationId: Id<"organizations">,
  userId: Id<"users">
) {
  return ctx.db
    .query("organizationMemberships")
    .withIndex("by_organizationId_userId", (q) =>
      q.eq("organizationId", organizationId).eq("userId", userId)
    )
    .first();
}

export async function requireOrganizationRole(
  ctx: AuthCtx,
  organizationId: Id<"organizations">,
  roles?: OrganizationRole[]
) {
  const userId = await requireUserId(ctx);
  const membership = await getOrganizationMembership(ctx, organizationId, userId);
  if (!membership || membership.status !== "active") {
    throw new ConvexError("Organization access required");
  }
  if (roles && !roles.includes(membership.role)) {
    throw new ConvexError("Insufficient organization permissions");
  }
  return { userId, membership };
}

export async function resolveInventionAccess(
  ctx: AuthCtx,
  inventionId: Id<"inventions">,
  userId: Id<"users">
): Promise<InventionAccess | null> {
  const invention = await ctx.db.get(inventionId);
  if (!invention) return null;

  // Legacy ownership remains valid until the migration has attached an organization.
  if (!invention.organizationId) {
    return invention.userId === userId ? "manage" : null;
  }

  const explicitGrant = await ctx.db
    .query("inventionAccessGrants")
    .withIndex("by_inventionId_userId", (q) =>
      q.eq("inventionId", inventionId).eq("userId", userId)
    )
    .first();
  if (explicitGrant) return explicitGrant.access;

  const membership = await getOrganizationMembership(ctx, invention.organizationId, userId);
  if (!membership || membership.status !== "active") return null;
  return defaultInventionAccessForRole(membership.role);
}

export async function requireInventionReadAccess(ctx: AuthCtx, inventionId: Id<"inventions">) {
  const userId = await requireUserId(ctx);
  const access = await resolveInventionAccess(ctx, inventionId, userId);
  if (!access) throw new ConvexError("Invention access required");
  return { userId, access };
}

export async function requireInventionEditAccess(ctx: AuthCtx, inventionId: Id<"inventions">) {
  const { userId, access } = await requireInventionReadAccess(ctx, inventionId);
  if (!canEditInvention(access)) throw new ConvexError("Invention edit access required");
  return { userId, access };
}

export async function requireInventionManageAccess(ctx: AuthCtx, inventionId: Id<"inventions">) {
  const { userId, access } = await requireInventionReadAccess(ctx, inventionId);
  if (!canManageInventionAccess(access)) throw new ConvexError("Invention management access required");
  return { userId, access };
}

async function ensurePersonalOrganizationForUser(ctx: MutationCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError("User not found");

  if (user.personalOrganizationId) {
    const existing = await ctx.db.get(user.personalOrganizationId);
    if (existing && existing.status !== "closed") return existing._id;
  }

  const memberships = await ctx.db
    .query("organizationMemberships")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const membership of memberships) {
    if (membership.role !== "owner" || membership.status !== "active") continue;
    const organization = await ctx.db.get(membership.organizationId);
    if (organization?.kind === "personal" && organization.status !== "closed") {
      await ctx.db.patch(userId, { personalOrganizationId: organization._id });
      return organization._id;
    }
  }

  const now = Date.now();
  const planKey = normalizeOrganizationPlanKey(user.subscriptionTier);
  const organizationId = await ctx.db.insert("organizations", {
    name: personalOrganizationName(user.name, user.email),
    kind: "personal",
    planKey,
    status: "active",
    createdByUserId: userId,
    billingCustomerId: user.billingCustomerId,
    subscriptionId: user.subscriptionId,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    createdAt: now,
    updatedAt: now,
  });

  await ctx.db.insert("organizationMemberships", {
    organizationId,
    userId,
    role: "owner",
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
  await ctx.db.patch(userId, { personalOrganizationId: organizationId });
  return organizationId;
}

export const ensurePersonalOrganization = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const organizationId = await ensurePersonalOrganizationForUser(ctx, userId);
    return { organizationId };
  },
});

export const migrateMyLegacyInventions = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const organizationId = await ensurePersonalOrganizationForUser(ctx, userId);
    const inventions = await ctx.db
      .query("inventions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    let migrated = 0;
    for (const invention of inventions) {
      if (invention.organizationId) continue;
      await ctx.db.patch(invention._id, { organizationId, updatedAt: Date.now() });
      migrated += 1;
    }
    return { organizationId, migrated };
  },
});

export const getMyOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const memberships = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const result = [];
    for (const membership of memberships) {
      if (membership.status !== "active") continue;
      const organization = await ctx.db.get(membership.organizationId);
      if (!organization || organization.status !== "active") continue;
      result.push({
        organizationId: organization._id,
        name: organization.name,
        kind: organization.kind,
        planKey: organization.planKey,
        role: membership.role,
      });
    }
    return result;
  },
});

export const getMyInventionAccess = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return resolveInventionAccess(ctx, args.inventionId, userId);
  },
});

export const grantInventionAccess = mutation({
  args: {
    inventionId: v.id("inventions"),
    userId: v.id("users"),
    access: v.union(v.literal("manage"), v.literal("edit"), v.literal("view"), v.literal("review")),
  },
  handler: async (ctx, args) => {
    const { userId: actingUserId } = await requireInventionManageAccess(ctx, args.inventionId);
    const invention = await ctx.db.get(args.inventionId);
    if (!invention?.organizationId) throw new ConvexError("Migrate invention to an organization first");

    const targetMembership = await getOrganizationMembership(ctx, invention.organizationId, args.userId);
    if (!targetMembership || targetMembership.status !== "active") {
      throw new ConvexError("Target user must be an active organization member");
    }

    const existing = await ctx.db
      .query("inventionAccessGrants")
      .withIndex("by_inventionId_userId", (q) =>
        q.eq("inventionId", args.inventionId).eq("userId", args.userId)
      )
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { access: args.access, grantedByUserId: actingUserId, updatedAt: now });
      return existing._id;
    }
    return ctx.db.insert("inventionAccessGrants", {
      inventionId: args.inventionId,
      organizationId: invention.organizationId,
      userId: args.userId,
      access: args.access,
      grantedByUserId: actingUserId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const canManageMyOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const membership = await getOrganizationMembership(ctx, args.organizationId, userId);
    return Boolean(membership && membership.status === "active" && canManageOrganization(membership.role));
  },
});
