import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getById = internalQuery({
  args: { purchaseId: v.id("purchases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.purchaseId);
  },
});

export async function getPurchaseByExternalIdHandler(
  ctx: { db: { normalizeId: (table: "purchases", id: string) => any; get: (id: any) => Promise<any> } },
  args: { purchaseId: string },
) {
  const normalizedId = ctx.db.normalizeId("purchases", args.purchaseId);
  if (!normalizedId) return null;
  return await ctx.db.get(normalizedId);
}

// HTTP download links carry opaque IDs as strings. Normalize the external
// value before any typed database read so malformed links fail closed as
// "not found" instead of surfacing a Convex argument-validation exception.
export const getByExternalId = internalQuery({
  args: { purchaseId: v.string() },
  handler: getPurchaseByExternalIdHandler,
});

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
}

// Returns the data the success page needs to render — masked email, product
// title, and the per-purchase download URL. Looked up by Stripe session id so
// the success page can resolve a fresh checkout without authentication.
export const getOrderForSuccessPage = internalQuery({
  args: { stripeCheckoutSessionId: v.string() },
  handler: async (ctx, args) => {
    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_stripeCheckoutSessionId", (q) =>
        q.eq("stripeCheckoutSessionId", args.stripeCheckoutSessionId)
      )
      .unique();

    if (!purchase) return null;

    const product = await ctx.db.get(purchase.productId);

    return {
      purchaseId: purchase._id,
      downloadToken: purchase.downloadToken,
      productTitle: product?.title ?? "Your purchase",
      productId: purchase.productId,
      amountCents: purchase.amountCents,
      currency: purchase.currency,
      customerEmail: maskEmail(purchase.customerEmail),
      fulfillmentStatus: purchase.fulfillmentStatus,
      createdAt: purchase.createdAt,
    };
  },
});
