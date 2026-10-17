import { httpRouter, makeFunctionReference } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { fulfillmentWebhookHandler } from "./fulfillmentWebhook";
import { subscriptionWebhookHandler } from "./subscriptionWebhook";

const http = httpRouter();
const healthProbe = makeFunctionReference<"query", Record<string, never>, {
  databaseReachable: boolean;
  sampledUser: boolean;
  hasQueuedWork: boolean;
  hasFailedWork: boolean;
  checkedAt: number;
}>("operationalHealth:healthProbe");

auth.addHttpRoutes(http);

http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async (ctx) => {
    try {
      const probe = await ctx.runQuery(healthProbe, {});
      const configuration = {
        ai: Boolean(process.env.OPENAI_API_KEY),
        auth: Boolean(process.env.JWT_PRIVATE_KEY && process.env.JWKS),
        fulfillmentWebhook: Boolean(process.env.PLATFORM_FULFILLMENT_SECRET),
        subscriptionWebhook: Boolean(process.env.ATLAS_SUBSCRIPTION_WEBHOOK_SECRET),
      };
      const ready = probe.databaseReachable && configuration.ai && configuration.auth;
      return new Response(JSON.stringify({
        ok: true,
        ready,
        service: "atlas",
        databaseReachable: probe.databaseReachable,
        configuration,
        checkedAt: probe.checkedAt,
      }), {
        status: ready ? 200 : 503,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    } catch {
      return new Response(JSON.stringify({ ok: false, ready: false, service: "atlas" }), {
        status: 503,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }
  }),
});

http.route({
  path: "/api/fulfillment",
  method: "POST",
  handler: httpAction(async (ctx, request) => fulfillmentWebhookHandler(ctx, request)),
});

http.route({
  path: "/api/subscription",
  method: "POST",
  handler: httpAction(async (ctx, request) => subscriptionWebhookHandler(ctx, request)),
});

http.route({
  path: "/api/download",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const purchaseId = url.searchParams.get("purchaseId");
    const token = url.searchParams.get("token");
    const fileId = url.searchParams.get("fileId");

    if (!purchaseId || !token) {
      return new Response(
        JSON.stringify({ error: "Missing purchaseId or token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const purchase = await ctx.runQuery(internal.purchasesInternal.getById, {
      purchaseId: purchaseId as any,
    });

    if (!purchase || purchase.downloadToken !== token || purchase.fulfillmentStatus !== "fulfilled") {
      return new Response(
        JSON.stringify({ error: "Invalid download link" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const files = await ctx.runQuery(internal.filesInternal.getByProductId, {
      productId: purchase.productId,
    });
    const requested = fileId ? files.find((file) => String(file._id) === fileId) : files[0];
    if (!requested) return new Response(JSON.stringify({ error: "File not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    const signedUrl = await ctx.storage.getUrl(requested.storageId);
    if (!signedUrl) return new Response(JSON.stringify({ error: "File unavailable" }), { status: 404, headers: { "Content-Type": "application/json" } });
    return Response.redirect(signedUrl, 302);
  }),
});

export default http;