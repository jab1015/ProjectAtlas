import { httpRouter, makeFunctionReference } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { downloadHandler } from "./downloadHandler";
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
  handler: httpAction(async (ctx, request) => downloadHandler(ctx, request)),
});

export default http;