import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("structured account export", () => {
  it("requires authentication and exports invention-owned structured data", () => {
    const source = read("convex/privacyExport.ts");
    expect(source).toContain("getAuthUserId(ctx)");
    expect(source).toContain('query("inventions").withIndex("by_userId"');
    expect(source).toContain('query("atlasDeliverables")');
    expect(source).toContain('query("conversationMessages")');
  });

  it("does not export credential or bearer-token tables and strips purchase download tokens", () => {
    const source = read("convex/privacyExport.ts");
    expect(source).not.toContain('ctx.db.query("authSessions")');
    expect(source).not.toContain('ctx.db.query("authAccounts")');
    expect(source).not.toContain('ctx.db.query("authRefreshTokens")');
    expect(source).not.toContain("downloadToken: purchase.downloadToken");
    expect(source).toContain('"auth sessions"');
    expect(source).toContain('"download bearer tokens"');
    expect(source).toContain('"server/API keys"');
  });

  it("keeps binary file bytes outside the structured JSON export", () => {
    const source = read("convex/privacyExport.ts");
    expect(source).toContain("binaryContentIncluded: false");
    expect(source).not.toContain("ctx.storage.get(");
  });

  it("exposes a user-visible authenticated download route", () => {
    const page = read("src/app/(app)/account/data-export/page.tsx");
    const nav = read("src/components/atlas/app-nav.tsx");
    expect(page).toContain("privacyExport:getMyStructuredExport");
    expect(page).toContain("Download JSON export");
    expect(page).toContain("URL.createObjectURL");
    expect(nav).toContain('/account/data-export');
  });
});
