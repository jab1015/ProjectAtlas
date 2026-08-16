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

  it("requires organization-aware edit access for every validation-research write", () => {
    const file = source("validationResearchMutations.ts");
    expect(file).toContain("requireInventionEditAccess");
    expect(exportedFunctionBlock(file, "triggerValidationResearch")).toContain("requireOwnedInvention");
    for (const name of ["approveValidationSection", "editValidationSection", "refreshValidationSection"]) {
      expect(exportedFunctionBlock(file, name)).toContain("requireOwnedResearch");
    }
  });

  it("uses organization-aware access for the primary invention workspace", () => {
    const file = source("inventionWorkspace.ts");
    expect(file).not.toContain("invention.userId !== userId");
    for (const name of ["getWorkspaceState", "getStatusBriefing", "getReviewQueue", "getDeliverableLibrary", "getPilotEvaluation"]) {
      expect(exportedFunctionBlock(file, name)).toMatch(/requireInventionReadAccess|getAccessibleInvention/);
    }
    expect(exportedFunctionBlock(file, "ensureInventionRecord")).toContain("requireInventionEditAccess");
    expect(exportedFunctionBlock(file, "kickAutonomousWork")).toContain("requireInventionEditAccess");
    expect(exportedFunctionBlock(file, "respondToBlockedWork")).toContain("requireInventionEditAccess");
    expect(exportedFunctionBlock(file, "resolveDecision")).toContain("requireInventionManageAccess");
    expect(exportedFunctionBlock(file, "resolveApprovalRequest")).toContain("requireInventionManageAccess");
  });

  it("uses organization-aware access for Ask InventSmith", () => {
    const file = source("atlasChat.ts");
    expect(file).not.toContain("invention.userId !== userId");
    expect(exportedFunctionBlock(file, "getConversation")).toContain("requireInventionReadAccess");
    expect(exportedFunctionBlock(file, "ask")).toContain("requireInventionEditAccess");
  });

  it("uses organization-aware access for the invention evidence locker", () => {
    const file = source("files.ts");
    expect(file).not.toContain("invention.userId !== userId");
    expect(exportedFunctionBlock(file, "generateInventionEvidenceUploadUrl")).toContain("requireInventionEditAccess");
    expect(exportedFunctionBlock(file, "registerInventionEvidence")).toContain("requireInventionEditAccess");
    expect(exportedFunctionBlock(file, "listInventionEvidence")).toContain("requireInventionReadAccess");
    expect(exportedFunctionBlock(file, "removeInventionEvidence")).toContain("requireInventionManageAccess");
  });

  it("uses organization-aware edit access for evidence extraction retries", () => {
    const file = source("evidenceExtractionControl.ts");
    const block = exportedFunctionBlock(file, "retryEvidenceExtraction");
    expect(file).not.toContain("invention.userId !== userId");
    expect(block).toContain("requireInventionEditAccess");
  });

  it("uses organization-aware authorization across the legacy journey engine surfaces", () => {
    const file = source("journeyEngine.ts");
    expect(exportedFunctionBlock(file, "getInventionState")).toContain("resolveInventionAccess");
    expect(exportedFunctionBlock(file, "updateStageProgress")).toContain("requireInventionEditAccess");
    expect(exportedFunctionBlock(file, "updateInventionField")).toContain("requireInventionEditAccess");
    expect(exportedFunctionBlock(file, "advanceStage")).toContain("requireInventionEditAccess");
    expect(exportedFunctionBlock(file, "deleteInvention")).toContain("requireInventionManageAccess");
    expect(exportedFunctionBlock(file, "deleteInvention")).toContain("resolveInventionUsageScope");
    expect(exportedFunctionBlock(file, "deleteInvention")).toContain("ensureOrganizationDailyUsage");
  });
});
