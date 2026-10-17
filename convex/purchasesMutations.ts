import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

const fulfillmentArgs = {
  productId: v.id("products"),
  customerEmail: v.string(),
  customerName: v.optional(v.string()),
  platformOrderId: v.optional(v.string()),
  stripeCheckoutSessionId: v.optional(v.string()),
  amountCents: v.number(),
  currency: v.string(),
  downloadToken: v.string(),
};

type FulfillmentArgs = {
  productId: any;
  customerEmail: string;
  customerName?: string;
  platformOrderId?: string;
  stripeCheckoutSessionId?: string;
  amountCents: number;
  currency: string;
  downloadToken: string;
};

export async function createFromFulfillmentHandler(ctx: any, args: FulfillmentArgs) {
  // Idempotency: prefer the Stripe session id (one per checkout), fall back
  // to the platform order id. Either is unique per fulfilled purchase.
  if (args.stripeCheckoutSessionId) {
    const existing = await ctx.db
      .query("purchases")
      .withIndex("by_stripeCheckoutSessionId", (q: any) =>
        q.eq("stripeCheckoutSessionId", args.stripeCheckoutSessionId)
      )
      .unique();

    if (existing) {
      return { purchaseId: existing._id, created: false as const };
    }
  }

  if (args.platformOrderId) {
    const existing = await ctx.db
      .query("purchases")
      .withIndex("by_platformOrderId", (q: any) =>
        q.eq("platformOrderId", args.platformOrderId)
      )
      .unique();

    if (existing) {
      // Backfill the session id for older rows that predate this field.
      if (
        args.stripeCheckoutSessionId &&
        !existing.stripeCheckoutSessionId
      ) {
        await ctx.db.patch(existing._id, {
          stripeCheckoutSessionId: args.stripeCheckoutSessionId,
        });
      }
      return { purchaseId: existing._id, created: false as const };
    }
  }

  // Try to link to a user by email.
  const user = await ctx.db
    .query("users")
    .withIndex("email", (q: any) => q.eq("email", args.customerEmail))
    .first();

  const purchaseId = await ctx.db.insert("purchases", {
    productId: args.productId,
    customerEmail: args.customerEmail,
    customerName: args.customerName,
    userId: user?._id,
    platformOrderId: args.platformOrderId,
    stripeCheckoutSessionId: args.stripeCheckoutSessionId,
    amountCents: args.amountCents,
    currency: args.currency,
    downloadToken: args.downloadToken,
    downloadCount: 0,
    fulfillmentStatus: "fulfilled",
    createdAt: Date.now(),
  });

  return { purchaseId, created: true as const };
}

// Compatibility API for existing internal callers that only need the purchase id.
export const createFromFulfillment = internalMutation({
  args: fulfillmentArgs,
  handler: async (ctx, args) => {
    const result = await createFromFulfillmentHandler(ctx, args);
    return result.purchaseId;
  },
});

// Replay-aware API for fulfillment ingress. The caller can safely distinguish
// a newly created purchase from an idempotent replay.
export const createFromFulfillmentWithStatus = internalMutation({
  args: fulfillmentArgs,
  handler: createFromFulfillmentHandler,
});

export const recordDownload = internalMutation({
  args: {
    purchaseId: v.id("purchases"),
  },
  handler: async (ctx, args) => {
    const purchase = await ctx.db.get(args.purchaseId);
    if (!purchase) {
      throw new Error(`Purchase ${args.purchaseId} not found`);
    }

    await ctx.db.patch(args.purchaseId, {
      downloadCount: purchase.downloadCount + 1,
      lastDownloadedAt: Date.now(),
    });
  },
});

export const linkUserToPurchases = internalMutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_customerEmail", (q) =>
        q.eq("customerEmail", args.email)
      )
      .collect();

    for (const purchase of purchases) {
      if (!purchase.userId) {
        await ctx.db.patch(purchase._id, {
          userId: args.userId,
        });
      }
    }
  },
});
