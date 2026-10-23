export const AUTOMATED_INTERNAL_LEGAL_REVIEWER = "InventSmith Internal Legal Department";
export const AUTOMATED_INTERNAL_LEGAL_REFERENCE = "Automated internal Legal design authorization";
export const AUTOMATED_INTERNAL_LEGAL_NOTES =
  "Internal Legal automatically reviewed the Patent Readiness packet for the Product Design handoff. This is an operational design authorization only; it is not a patentability opinion, freedom-to-operate opinion, legal clearance, or filing approval.";
export const AUTOMATED_DESIGN_AROUND_INSTRUCTIONS =
  "Create materially different product design directions that address the Internal Legal conflict findings in the inventor record and Patent Readiness packet. Explicitly avoid the identified overlap zones, preserve the user problem and core constraints where possible, and document tradeoffs. This is an automated design-around exploration, not a patentability, freedom-to-operate, legal-clearance, or engineering-approval conclusion.";

export type InternalLegalDisposition = {
  outcome: "proceed_to_product_design" | "redesign_required" | "outside_authority";
  conflictLevel: "none_identified" | "preliminary_overlap" | "material_overlap" | "unclear";
  designDirectionRequired: boolean;
  reason: string;
};

export const MAX_AUTOMATED_LEGAL_ITERATIONS = 3;

export function shouldAutoApproveInternalLegal(
  deliverableKind: string,
  specialty: string,
  disposition?: InternalLegalDisposition | null,
): boolean {
  return Boolean(
    deliverableKind === "patent_design_handoff" &&
    specialty === "patent" &&
    disposition?.outcome === "proceed_to_product_design" &&
    disposition.conflictLevel === "none_identified" &&
    disposition.designDirectionRequired === false,
  );
}

export function shouldRouteToAutomatedRedesign(
  deliverableKind: string,
  specialty: string,
  disposition?: InternalLegalDisposition | null,
) {
  return Boolean(
    deliverableKind === "patent_design_handoff" &&
    specialty === "patent" &&
    disposition?.outcome === "redesign_required",
  );
}
