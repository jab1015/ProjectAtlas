import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const reviewPage = readFileSync(
  join(process.cwd(), "src", "app", "(app)", "invention", "[id]", "review", "page.tsx"),
  "utf8",
);

const guardedApprovalMutation = readFileSync(
  join(process.cwd(), "convex", "consequentialApprovalMutation.ts"),
  "utf8",
);

describe("consequential approval UI routing", () => {
  it("routes inventor approval decisions through the exact-artifact guarded mutation", () => {
    expect(reviewPage).toContain("consequentialApprovalMutation:resolveConsequentialApproval");
    expect(reviewPage).not.toContain("inventionWorkspace:resolveApprovalRequest");
    expect(reviewPage).toContain("Approve action");
    expect(reviewPage).toContain("Decline");
  });

  it("keeps approval and execution fail-closed on current exact artifact scope", () => {
    expect(guardedApprovalMutation).toContain("validateExactAuthorizedArtifacts");
    expect(guardedApprovalMutation).toContain("loadApprovalArtifactScope");
    expect(guardedApprovalMutation).toContain("requireCurrentApprovedExternalAction");
    expect(guardedApprovalMutation).toContain("requireInventionManageAccess");
    expect(guardedApprovalMutation).toContain('deliverable.trustState !== "ready_for_authorized_use"');
  });
});
