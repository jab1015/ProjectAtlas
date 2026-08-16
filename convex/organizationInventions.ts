import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import {
  canCreateActiveInvention,
  defaultInventionAccessForRole,
} from "./organizationPolicyLogic";
import { getOrganizationMembership, resolveInventionAccess } from "./organizations";
import {
  classifyInvention,
  unsupportedInventionMessage,
} from "./inventionClassificationLogic";
import { initializeClassifiedInvention } from "./inventionInitialization";

/**
 * Organization-native invention entry points.
 *
 * New inventions are classified before persistence so unsupported harmful or
 * abusive concepts never receive a normal workspace. Supported physical,
 * software, hybrid and regulated inventions receive a tailored work plan.
 */
export const create = mutation({
  args: {
    organizationId: v.id("organizations"),
    title: v.string(),
    problemStatement: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    solutionDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Authentication required");

    const organization = await ctx.db.get(args.organizationId);
    if (!organization || organization.status !== "active") {
      throw new ConvexError("Organization not found");
    }

    const membership = await getOrganizationMembership(ctx, args.organizationId, userId);
    if (!membership || membership.status !== "active") {
      throw new ConvexError("Organization access required");
    }
    if (membership.role === "viewer" || membership.role === "professional") {
      throw new ConvexError("Organization role cannot create inventions");
    }

    const title = args.title.trim();
    if (!title) throw new ConvexError("Invention title is required");
    if (title.length > 200) throw new ConvexError("Invention title must be 200 characters or fewer");

    const brief = {
      title,
      problemStatement: args.problemStatement?.trim() || undefined,
      targetAudience: args.targetAudience?.trim() || undefined,
      solutionDescription: args.solutionDescription?.trim() || undefined,
    };
    const classification = classifyInvention(brief);
    if (classification.supportClass === "unsupported") {
      throw new ConvexError(unsupportedInventionMessage(classification));
    }

    const activeInventions = await ctx.db
      .query("inventions")
      .withIndex("by_organizationId_status", (q) =>
        q.eq("organizationId", args.organizationId).eq("status", "active")
      )
      .collect();
    if (!canCreateActiveInvention(organization.planKey, activeInventions.length)) {
      throw new ConvexError("Organization active-invention limit reached");
    }

    const now = Date.now();
    const inventionId = await ctx.db.insert("inventions", {
      userId,
      organizationId: args.organizationId,
      ...brief,
      currentStageId: 1,
      createdAt: now,
      updatedAt: now,
      status: "active",
    });

    // Explicit creator grant protects the creator's management rights even if
    // their organization role changes later.
    await ctx.db.insert("inventionAccessGrants", {
      inventionId,
      organizationId: args.organizationId,
      userId,
      access: "manage",
      grantedByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });

    const plan = await initializeClassifiedInvention(ctx, inventionId, userId, brief, classification, now);

    await ctx.db.insert("stageProgress", {
      inventionId,
      stageId: 1,
      readinessScore: 100,
      completedFields: ["title", "problemStatement", "targetAudience", "solutionDescription"],
      completedAt: now,
      updatedAt: now,
    });

    return {
      inventionId,
      classification: {
        productType: classification.productType,
        supportClass: classification.supportClass,
        categories: classification.categories,
        professionalReviewAreas: classification.professionalReviewAreas,
      },
      workPlanCount: plan.totalCount,
    };
  },
});

export const listForOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Authentication required");

    const membership = await getOrganizationMembership(ctx, args.organizationId, userId);
    if (!membership || membership.status !== "active") {
      throw new ConvexError("Organization access required");
    }

    const inventions = await ctx.db
      .query("inventions")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const visible = [];
    for (const invention of inventions) {
      const explicit = await ctx.db
        .query("inventionAccessGrants")
        .withIndex("by_inventionId_userId", (q) =>
          q.eq("inventionId", invention._id).eq("userId", userId)
        )
        .first();
      const access = explicit?.access ?? defaultInventionAccessForRole(membership.role);
      if (access) visible.push({ ...invention, access });
    }

    return visible.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const archive = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Authentication required");
    const access = await resolveInventionAccess(ctx, args.inventionId, userId);
    if (access !== "manage") throw new ConvexError("Invention management access required");

    const invention = await ctx.db.get(args.inventionId);
    if (!invention) throw new ConvexError("Invention not found");
    if (invention.status === "archived") return { archived: false };

    await ctx.db.patch(args.inventionId, { status: "archived", updatedAt: Date.now() });
    return { archived: true };
  },
});

export const restore = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Authentication required");
    const access = await resolveInventionAccess(ctx, args.inventionId, userId);
    if (access !== "manage") throw new ConvexError("Invention management access required");

    const invention = await ctx.db.get(args.inventionId);
    if (!invention) throw new ConvexError("Invention not found");
    if (!invention.organizationId) {
      throw new ConvexError("Migrate invention to an organization first");
    }
    if (invention.status === "active") return { restored: false };

    const organization = await ctx.db.get(invention.organizationId);
    if (!organization || organization.status !== "active") {
      throw new ConvexError("Organization not found");
    }
    const activeInventions = await ctx.db
      .query("inventions")
      .withIndex("by_organizationId_status", (q) =>
        q.eq("organizationId", invention.organizationId).eq("status", "active")
      )
      .collect();
    if (!canCreateActiveInvention(organization.planKey, activeInventions.length)) {
      throw new ConvexError("Organization active-invention limit reached");
    }

    await ctx.db.patch(args.inventionId, { status: "active", updatedAt: Date.now() });
    return { restored: true };
  },
});