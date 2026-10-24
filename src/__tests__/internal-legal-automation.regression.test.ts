import { describe, expect, it } from "vitest";
import {
  shouldAutoApproveInternalLegal,
  shouldRouteToAutomatedRedesign,
  AUTOMATED_INTERNAL_LEGAL_NOTES,
  AUTOMATED_INTERNAL_LEGAL_REFERENCE,
  AUTOMATED_INTERNAL_LEGAL_REVIEWER,
} from "@convex/internalLegalAutomationLogic";

const proceed = {
  outcome: "proceed_to_product_design" as const,
  conflictLevel: "none_identified" as const,
  designDirectionRequired: false,
  reason: "No material active or unclear overlap identified in the current design.",
};

const redesign = {
  outcome: "redesign_required" as const,
  conflictLevel: "material_overlap" as const,
  designDirectionRequired: true,
  reason: "The threaded lift architecture materially overlaps the current prior-art family.",
};

describe("automated Internal Legal certification", () => {
  it("records an auditable operational certification only for a clean Legal disposition", () => {
    expect(shouldAutoApproveInternalLegal("patent_design_handoff", "patent", proceed)).toBe(true);
    expect(AUTOMATED_INTERNAL_LEGAL_REVIEWER).toBe("InventSmith Internal Legal Department");
    expect(AUTOMATED_INTERNAL_LEGAL_REFERENCE).toContain("Automated internal Legal");
    expect(AUTOMATED_INTERNAL_LEGAL_NOTES).toContain("not a patentability opinion");
  });

  it("never certifies a conflicted or incomplete packet into Product Design", () => {
    expect(shouldAutoApproveInternalLegal("patent_design_handoff", "patent", redesign)).toBe(false);
    expect(shouldAutoApproveInternalLegal("patent_design_handoff", "patent", {
      ...proceed,
      conflictLevel: "unclear",
    })).toBe(false);
    expect(shouldAutoApproveInternalLegal("patent_design_handoff", "engineering", proceed)).toBe(false);
  });

  it("routes material overlap back into bounded automated redesign", () => {
    expect(shouldRouteToAutomatedRedesign("patent_design_handoff", "patent", redesign)).toBe(true);
    expect(shouldRouteToAutomatedRedesign("patent_design_handoff", "patent", proceed)).toBe(false);
  });
});
