export const AUTOMATED_INTERNAL_LEGAL_REVIEWER = "InventSmith Internal Legal Department";
export const AUTOMATED_INTERNAL_LEGAL_REFERENCE = "Automated internal Legal design authorization";
export const AUTOMATED_INTERNAL_LEGAL_NOTES =
  "Internal Legal automatically reviewed the Patent Readiness packet for the Product Design handoff. This is an operational design authorization only; it is not a patentability opinion, freedom-to-operate opinion, legal clearance, or filing approval.";

export function shouldAutoApproveInternalLegal(deliverableKind: string, specialty: string): boolean {
  return deliverableKind === "patent_design_handoff" && specialty === "patent";
}
