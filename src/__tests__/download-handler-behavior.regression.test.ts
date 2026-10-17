import { describe, expect, it, vi } from "vitest";

import { downloadHandler } from "../../convex/downloadHandler";
import { getPurchaseByExternalIdHandler } from "../../convex/purchasesInternal";

function request(query = "purchaseId=purchase-1&token=token-1") {
  return new Request(`https://inventsmith.example/api/download?${query}`);
}

function buildCtx(args?: {
  purchase?: Record<string, any> | null;
  files?: Array<Record<string, any>>;
  signedUrl?: string | null;
  recordError?: Error;
}) {
  const purchase = args?.purchase === undefined
    ? {
        _id: "purchase-1",
        productId: "product-1",
        downloadToken: "token-1",
        fulfillmentStatus: "fulfilled",
      }
    : args.purchase;
  const files = args?.files ?? [
    { _id: "file-1", storageId: "storage-1" },
    { _id: "file-2", storageId: "storage-2" },
  ];
  const signedUrl = args?.signedUrl === undefined
    ? "https://storage.example/signed-file"
    : args.signedUrl;
  let queryCall = 0;
  const runQuery = vi.fn(async (_reference: unknown, _queryArgs: unknown) => {
    queryCall += 1;
    return queryCall === 1 ? purchase : files;
  });
  const runMutation = vi.fn(async (_reference: unknown, _mutationArgs: unknown) => {
    if (args?.recordError) throw args.recordError;
    return undefined;
  });
  const getUrl = vi.fn(async (_storageId: unknown) => signedUrl);

  return {
    ctx: { runQuery, runMutation, storage: { getUrl } } as any,
    runQuery,
    runMutation,
    getUrl,
  };
}

describe("download handler behavior", () => {
  it("rejects missing purchase or token before any backend access", async () => {
    for (const query of ["token=token-1", "purchaseId=purchase-1", ""]) {
      const state = buildCtx();
      const response = await downloadHandler(state.ctx, request(query));

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Missing purchaseId or token" });
      expect(state.runQuery).not.toHaveBeenCalled();
      expect(state.runMutation).not.toHaveBeenCalled();
      expect(state.getUrl).not.toHaveBeenCalled();
    }
  });

  it("rejects missing, wrong-token, and unfulfilled purchases before file lookup", async () => {
    const variants = [
      null,
      {
        _id: "purchase-1",
        productId: "product-1",
        downloadToken: "different-token",
        fulfillmentStatus: "fulfilled",
      },
      {
        _id: "purchase-1",
        productId: "product-1",
        downloadToken: "token-1",
        fulfillmentStatus: "pending",
      },
    ];

    for (const purchase of variants) {
      const state = buildCtx({ purchase });
      const response = await downloadHandler(state.ctx, request());

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: "Invalid download link" });
      expect(state.runQuery).toHaveBeenCalledTimes(1);
      expect(state.runMutation).not.toHaveBeenCalled();
      expect(state.getUrl).not.toHaveBeenCalled();
    }
  });

  it("does not allow a requested file id outside the purchased product file set", async () => {
    const state = buildCtx();
    const response = await downloadHandler(
      state.ctx,
      request("purchaseId=purchase-1&token=token-1&fileId=file-other"),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "File not found" });
    expect(state.runQuery).toHaveBeenCalledTimes(2);
    expect(state.getUrl).not.toHaveBeenCalled();
    expect(state.runMutation).not.toHaveBeenCalled();
  });

  it("returns unavailable without recording when storage cannot issue a signed url", async () => {
    const state = buildCtx({ signedUrl: null });
    const response = await downloadHandler(state.ctx, request());

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "File unavailable" });
    expect(state.getUrl).toHaveBeenCalledWith("storage-1");
    expect(state.runMutation).not.toHaveBeenCalled();
  });

  it("records the authorized purchase once before redirecting to the default file", async () => {
    const state = buildCtx();
    const response = await downloadHandler(state.ctx, request());

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://storage.example/signed-file");
    expect(state.runQuery).toHaveBeenCalledTimes(2);
    expect(state.getUrl).toHaveBeenCalledTimes(1);
    expect(state.getUrl).toHaveBeenCalledWith("storage-1");
    expect(state.runMutation).toHaveBeenCalledTimes(1);
    expect(state.runMutation.mock.calls[0]![1]).toEqual({ purchaseId: "purchase-1" });
  });

  it("records a specifically selected purchased file and uses only that product file", async () => {
    const state = buildCtx();
    const response = await downloadHandler(
      state.ctx,
      request("purchaseId=purchase-1&token=token-1&fileId=file-2"),
    );

    expect(response.status).toBe(302);
    expect(state.getUrl).toHaveBeenCalledWith("storage-2");
    expect(state.runMutation).toHaveBeenCalledTimes(1);
  });

  it("does not issue a redirect when download accounting fails", async () => {
    const state = buildCtx({ recordError: new Error("accounting unavailable") });

    await expect(downloadHandler(state.ctx, request())).rejects.toThrow("accounting unavailable");
    expect(state.getUrl).toHaveBeenCalledTimes(1);
    expect(state.runMutation).toHaveBeenCalledTimes(1);
  });
});

describe("external purchase id normalization", () => {
  it("returns null for malformed ids without a database lookup", async () => {
    const get = vi.fn(async (_id: unknown) => ({ _id: "should-not-read" }));
    const normalizeId = vi.fn((_table: "purchases", _id: string) => null);

    const result = await getPurchaseByExternalIdHandler(
      { db: { normalizeId, get } },
      { purchaseId: "not-a-convex-id" },
    );

    expect(result).toBeNull();
    expect(normalizeId).toHaveBeenCalledWith("purchases", "not-a-convex-id");
    expect(get).not.toHaveBeenCalled();
  });

  it("reads exactly the normalized purchase id when normalization succeeds", async () => {
    const purchase = { _id: "normalized-purchase" };
    const get = vi.fn(async (id: unknown) => id === "normalized-purchase" ? purchase : null);
    const normalizeId = vi.fn((_table: "purchases", _id: string) => "normalized-purchase");

    const result = await getPurchaseByExternalIdHandler(
      { db: { normalizeId, get } },
      { purchaseId: "external-value" },
    );

    expect(result).toEqual(purchase);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("normalized-purchase");
  });
});
