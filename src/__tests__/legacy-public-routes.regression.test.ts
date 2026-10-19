import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("retired public storefront routes", () => {
  it("routes legacy product/category/library surfaces into InventSmith", () => {
    const products = read("src/app/(public)/products/page.tsx");
    const category = read("src/app/(public)/categories/[slug]/page.tsx");
    const library = read("src/app/(public)/library/page.tsx");

    expect(products).toContain('redirect("/journey")');
    expect(category).toContain('redirect("/journey")');
    expect(library).toContain('redirect("/sign-in")');
    expect(category).not.toContain("ProductGrid");
    expect(library).not.toContain("Account Features Coming Soon");
    expect(library).not.toContain("Browse Products");
  });

  it("preserves token-gated legacy fulfilled-download compatibility instead of breaking existing purchase links", () => {
    const downloads = read("src/app/(public)/downloads/[purchaseId]/page.tsx");
    expect(downloads).toContain("api.purchases.getByToken");
    expect(downloads).toContain("api.files.getByProduct");
    expect(downloads).toContain("downloadToken: token");
    expect(downloads).toContain("Back to InventSmith");
  });
});
