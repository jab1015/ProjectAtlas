import { internal } from "./_generated/api";

type DownloadHandlerCtx = {
  runQuery: (reference: any, args: any) => Promise<any>;
  runMutation: (reference: any, args: any) => Promise<any>;
  storage: {
    getUrl: (storageId: any) => Promise<string | null>;
  };
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function downloadHandler(ctx: DownloadHandlerCtx, request: Request) {
  const url = new URL(request.url);
  const purchaseId = url.searchParams.get("purchaseId");
  const token = url.searchParams.get("token");
  const fileId = url.searchParams.get("fileId");

  if (!purchaseId || !token) {
    return jsonResponse({ error: "Missing purchaseId or token" }, 400);
  }

  const purchase = await ctx.runQuery(internal.purchasesInternal.getById, {
    purchaseId,
  });

  if (!purchase || purchase.downloadToken !== token || purchase.fulfillmentStatus !== "fulfilled") {
    return jsonResponse({ error: "Invalid download link" }, 403);
  }

  const files = await ctx.runQuery(internal.filesInternal.getByProductId, {
    productId: purchase.productId,
  });
  const requested = fileId
    ? files.find((file: any) => String(file._id) === fileId)
    : files[0];

  if (!requested) return jsonResponse({ error: "File not found" }, 404);

  const signedUrl = await ctx.storage.getUrl(requested.storageId);
  if (!signedUrl) return jsonResponse({ error: "File unavailable" }, 404);

  await ctx.runMutation(internal.purchasesMutations.recordDownload, {
    purchaseId: purchase._id,
  });

  return Response.redirect(signedUrl, 302);
}
