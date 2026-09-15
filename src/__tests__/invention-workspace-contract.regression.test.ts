import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "convex", "inventionWorkspace.ts"), "utf8");

function exportedFunctionBlock(name: string) {
  const start = source.indexOf(`export const ${name} =`);
  if (start < 0) throw new Error(`Missing exported function ${name}`);
  const next = source.indexOf("export const ", start + 13);
  return source.slice(start, next < 0 ? undefined : next);
}

describe("invention workspace operation contract", () => {
  it("retains every workspace operation that predates the CAD review refactor", () => {
    const requiredExports = [
      "getWorkspaceState",
      "getStatusBriefing",
      "getReviewQueue",
      "getDeliverableLibrary",
      "getPilotEvaluation",
      "ensureInventionRecord",
      "kickAutonomousWork",
      "resolveDecision",
      "resolveApprovalRequest",
      "respondToBlockedWork",
      "recordProfessionalReview",
      "createDecision",
      "requestApproval",
    ];

    for (const name of requiredExports) {
      expect(source).toContain(`export const ${name} =`);
    }
  });

  it("keeps decision validation, dedicated safety handlers, and all consequential approval categories", () => {
    expect(exportedFunctionBlock("createDecision")).toContain("Recommended option is not in the option list");
    expect(exportedFunctionBlock("respondToBlockedWork")).toContain("respondToBlockedWorkHandler");
    expect(exportedFunctionBlock("recordProfessionalReview")).toContain("recordProfessionalReviewHandler");

    const approval = exportedFunctionBlock("requestApproval");
    for (const actionType of [
      "share_confidential_information",
      "contact_third_party",
      "publish_or_disclose",
      "purchase_or_fee",
      "submit_or_file",
      "external_use",
      "other",
    ]) {
      expect(approval).toContain(`v.literal(\"${actionType}\")`);
    }
  });

  it("keeps organization-aware authorization on workspace reads and consequential resolutions", () => {
    expect(exportedFunctionBlock("getWorkspaceState")).toContain("getAccessibleInvention");
    expect(exportedFunctionBlock("getReviewQueue")).toContain("getAccessibleInvention");
    expect(exportedFunctionBlock("getDeliverableLibrary")).toContain("getAccessibleInvention");
    expect(exportedFunctionBlock("resolveDecision")).toContain("requireInventionManageAccess");
    expect(exportedFunctionBlock("resolveApprovalRequest")).toContain("requireInventionManageAccess");
  });
});
