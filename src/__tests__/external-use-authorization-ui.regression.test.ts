import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workPage = readFileSync(
  join(process.cwd(), "src", "app", "(app)", "invention", "[id]", "work", "page.tsx"),
  "utf8",
);

const mutationSource = readFileSync(
  join(process.cwd(), "convex", "externalUseAuthorization.ts"),
  "utf8",
);

describe("explicit external-use authorization UI", () => {
  it("uses the dedicated exact-artifact authorization mutation rather than treating professional review as permission", () => {
    expect(workPage).toContain('externalUseAuthorization:authorizeDeliverableExternalUse');
    expect(workPage).toContain("Authorize external use");
    expect(workPage).toContain("does not replace professional review");
    expect(workPage).toContain('deliverable.trustState !== "professional_review_required"');
  });

  it("warns that external-use authorization records permission but does not execute consequential real-world actions", () => {
    expect(workPage).toContain("This records your permission for this exact current revision");
    expect(workPage).toContain("does not replace professional review");
    expect(workPage).toContain("authorize spending");
    expect(workPage).toContain("contact a third party");
    expect(workPage).toContain("place a manufacturing order");
    expect(workPage).toContain("file a legal submission");
    expect(workPage).toContain("publish anything automatically");
  });

  it("keeps the backend authority on current revision, staleness, management access, required professional review, and non-execution semantics", () => {
    expect(mutationSource).toContain("requireInventionManageAccess");
    expect(mutationSource).toContain("latestRevisionIds.length !== 1");
    expect(mutationSource).toContain("deliverable.staleReason");
    expect(mutationSource).toContain("requiredProfessionalReviews(deliverable.kind)");
    expect(mutationSource).toContain('trustState: "ready_for_authorized_use"');
    expect(mutationSource).toContain("externalActionExecuted: false");
    expect(mutationSource).toContain("no external action was executed");
  });
});
