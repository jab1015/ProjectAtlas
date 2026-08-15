import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(file: string) {
  return readFileSync(join(process.cwd(), "convex", file), "utf8");
}

function exportedFunctionBlock(fileSource: string, name: string) {
  const start = fileSource.indexOf(`export const ${name} =`);
  if (start < 0) throw new Error(`Missing exported function ${name}`);
  const next = fileSource.indexOf("export const ", start + 13);
  return fileSource.slice(start, next < 0 ? undefined : next);
}

describe("backend authorization boundaries", () => {
  it.each([
    ["categories.ts", "create"], ["categories.ts", "update"], ["categories.ts", "remove"],
    ["faqEntries.ts", "create"], ["faqEntries.ts", "update"], ["faqEntries.ts", "remove"],
    ["testimonials.ts", "create"], ["testimonials.ts", "update"], ["testimonials.ts", "remove"],
    ["productsAdmin.ts", "create"], ["productsAdmin.ts", "update"], ["productsAdmin.ts", "remove"],
    ["productFiles.ts", "generateUploadUrl"], ["productFiles.ts", "list"], ["productFiles.ts", "create"],
    ["productFiles.ts", "remove"], ["productFiles.ts", "updateSortOrder"],
    ["products.ts", "listAll"], ["products.ts", "getById"],
    ["purchases.ts", "getByEmail"], ["purchases.ts", "getRecent"], ["purchases.ts", "listAll"], ["purchases.ts", "getStats"],
    ["privacyRequests.ts", "listPending"], ["privacyRequests.ts", "resolve"],
  ])("requires administrator authorization in %s:%s", (file, name) => {
    expect(exportedFunctionBlock(source(file), name)).toContain("await requireAdmin(ctx)");
  });

  it("binds file access to a fulfilled purchase token and product", () => {
    const block = exportedFunctionBlock(source("files.ts"), "getByProduct");
    expect(block).toContain("by_downloadToken");
    expect(block).toContain('fulfillmentStatus !== "fulfilled"');
    expect(block).toContain("purchase.productId");
  });

  it("requires ownership for every legacy validation-research write", () => {
    const file = source("validationResearchMutations.ts");
    expect(exportedFunctionBlock(file, "triggerValidationResearch")).toContain("requireOwnedInvention");
    for (const name of ["approveValidationSection", "editValidationSection", "refreshValidationSection"]) {
      expect(exportedFunctionBlock(file, name)).toContain("requireOwnedResearch");
    }
  });
});
