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
    expect(reviewPage).toContain("Authorize request");
    expect(reviewPage).toContain("Decline");
  });

  it("tells the inventor that approval records permission but does not execute an external action", () => {
    expect(reviewPage).toContain("Review permission for a future action");
    expect(reviewPage).toContain("Approval only records your authorization");
    expect(reviewPage).toContain("It does not contact a third party");
    expect(reviewPage).toContain("make a purchase or payment");
    expect(reviewPage).toContain("place an order");
    expect(reviewPage).toContain("submit or file anything");
    expect(reviewPage).toContain("publish anything");
    expect(reviewPage).toContain("future external action must pass its own current authorization checks");
  });

  it("keeps approval and execution fail-closed on current exact artifact scope", () => {
    expect(guardedApprovalMutation).toContain("validateExactAuthorizedArtifacts");
    expect(guardedApprovalMutation).toContain("loadApprovalArtifactScope");
    expect(guardedApprovalMutation).toContain("requireCurrentApprovedExternalAction");
    expect(guardedApprovalMutation).toContain("requireInventionManageAccess");
    expect(guardedApprovalMutation).toContain('deliverable.trustState !== "ready_for_authorized_use"');
    expect(guardedApprovalMutation).toContain("externalActionExecuted: false");
  });
});
