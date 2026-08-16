import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  canEditInvention,
  canManageInventionAccess,
  canManageOrganization,
  defaultInventionAccessForRole,
  getOrganizationPlanPolicy,
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

async function countOccupiedSeats(ctx: AuthCtx, organizationId: Id<"organizations">): Promise<number> {
  const memberships = await ctx.db
    .query("organizationMemberships")
    .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
    .collect();
  return memberships.filter((membership) => membership.status === "active" || membership.status === "invited").length;
}

async function assertSeatAvailable(ctx: AuthCtx, organizationId: Id<"organizations">) {
  const organization = await ctx.db.get(organizationId);
  if (!organization || organization.status !== "active") throw new ConvexError("Organization not found");
  const seatLimit = getOrganizationPlanPolicy(organization.planKey).includedSeatLimit;
  if (seatLimit === null) return;
  const occupiedSeats = await countOccupiedSeats(ctx, organizationId);
  if (occupiedSeats >= seatLimit) throw new ConvexError("Organization included-seat limit reached");
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

  // Active organization membership is always the outer security boundary.
  // An old explicit invention grant can never resurrect access for a removed or
  // suspended organization member.
  const membership = await getOrganizationMembership(ctx, invention.organizationId, userId);
  if (!membership || membership.status !== "active") return null;

  const explicitGrant = await ctx.db
    .query("inventionAccessGrants")
    .withIndex("by_inventionId_userId", (q) =>
      q.eq("inventionId", inventionId).eq("userId", userId)
    )
    .first();
  if (explicitGrant) return explicitGrant.access;

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
    subscriptionUpdatedAt: user.subscriptionUpdatedAt,
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

export const createOrganization = mutation({
  args: {
    name: v.string(),
    kind: v.union(v.literal("company"), v.literal("studio")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const name = args.name.trim();
    if (!name || name.length > 160) throw new ConvexError("Organization name must be between 1 and 160 characters");
    const now = Date.now();
    const organizationId = await ctx.db.insert("organizations", {
      name,
      kind: args.kind,
      // New organizations start unentitled. Billing activation upgrades this
      // organization rather than copying an existing user's paid entitlement.
      planKey: "explorer",
      status: "active",
      createdByUserId: userId,
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
    return { organizationId };
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
      const planPolicy = getOrganizationPlanPolicy(organization.planKey);
      result.push({
        organizationId: organization._id,
        name: organization.name,
        kind: organization.kind,
        planKey: organization.planKey,
        role: membership.role,
        activeInventionLimit: planPolicy.activeInventionLimit,
        includedSeatLimit: planPolicy.includedSeatLimit,
      });
    }
    return result;
  },
});

export const listOrganizationMembers = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireOrganizationRole(ctx, args.organizationId);
    const memberships = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect();
    const visible = memberships.filter((membership) => membership.status !== "removed");
    return Promise.all(visible.map(async (membership) => {
      const user = await ctx.db.get(membership.userId);
      return {
        membershipId: membership._id,
        userId: membership.userId,
        name: user?.name,
        email: user?.email,
        role: membership.role,
        status: membership.status,
      };
    }));
  },
});

export const addMemberByEmail = mutation({
  args: {
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer"), v.literal("professional")),
  },
  handler: async (ctx, args) => {
    await requireOrganizationRole(ctx, args.organizationId, ["owner", "admin"]);
    const normalizedEmail = args.email.trim().toLowerCase();
    if (!normalizedEmail) throw new ConvexError("Member email is required");
    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", normalizedEmail)).first();
    if (!user) {
      throw new ConvexError("That person must create an InventSmith account before they can be added to this organization");
    }

    const existing = await getOrganizationMembership(ctx, args.organizationId, user._id);
    if (existing?.status === "active") {
      if (existing.role === "owner") return { membershipId: existing._id, added: false };
      await ctx.db.patch(existing._id, { role: args.role, updatedAt: Date.now() });
      return { membershipId: existing._id, added: false };
    }

    await assertSeatAvailable(ctx, args.organizationId);
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { role: args.role, status: "active", updatedAt: now });
      return { membershipId: existing._id, added: true };
    }
    const membershipId = await ctx.db.insert("organizationMemberships", {
      organizationId: args.organizationId,
      userId: user._id,
      role: args.role,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    return { membershipId, added: true };
  },
});

export const updateMemberRole = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer"), v.literal("professional")),
  },
  handler: async (ctx, args) => {
    await requireOrganizationRole(ctx, args.organizationId, ["owner", "admin"]);
    const membership = await getOrganizationMembership(ctx, args.organizationId, args.userId);
    if (!membership || membership.status !== "active") throw new ConvexError("Active organization member not found");
    if (membership.role === "owner") throw new ConvexError("Organization ownership cannot be changed through member-role management");
    await ctx.db.patch(membership._id, { role: args.role, updatedAt: Date.now() });
    return { membershipId: membership._id };
  },
});

export const removeMember = mutation({
  args: { organizationId: v.id("organizations"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const { userId: actingUserId } = await requireOrganizationRole(ctx, args.organizationId, ["owner", "admin"]);
    const membership = await getOrganizationMembership(ctx, args.organizationId, args.userId);
    if (!membership || membership.status !== "active") return { removed: false };
    if (membership.role === "owner") throw new ConvexError("Transfer organization ownership before removing the owner");
    if (actingUserId === args.userId) throw new ConvexError("Use leave-organization flow to remove your own membership");
    await ctx.db.patch(membership._id, { status: "removed", updatedAt: Date.now() });
    return { removed: true };
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
