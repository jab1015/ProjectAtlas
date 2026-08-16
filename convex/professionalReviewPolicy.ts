export type ReviewSpecialty = "patent" | "contracts" | "engineering" | "regulatory" | "finance" | "other";

export interface RequiredProfessionalReview {
  specialty: ReviewSpecialty;
  requiredCredentials: string;
  scope: string;
}

const PATENT_REVIEW: RequiredProfessionalReview = {
  specialty: "patent",
  requiredCredentials: "Licensed patent attorney or registered patent agent appropriate to the jurisdiction and scope",
  scope: "Review search coverage, prior-art relevance, distinguishing-feature hypotheses, claim implications, disclosure, and legal next steps. No InventSmith output is a patentability or freedom-to-operate opinion.",
};

const CONTRACTS_REVIEW: RequiredProfessionalReview = {
  specialty: "contracts",
  requiredCredentials: "Licensed attorney appropriate to the inventor's jurisdiction and the transaction or agreement being considered",
  scope: "Review parties, facts, IP/confidentiality, obligations, remedies, liability, governing law, negotiation issues, filing/signature consequences, and whether the working draft is appropriate for authorized use. InventSmith drafts are not legal advice and are not final legal instruments.",
};

const ENGINEERING_REVIEW: RequiredProfessionalReview = {
  specialty: "engineering",
  requiredCredentials: "Qualified product-development engineer with experience relevant to the mechanism, materials, manufacturing process, and risk category",
  scope: "Review requirements, mechanisms, dimensions, materials, tolerances, failure modes, tests, CAD/drawings, manufacturing assumptions, and suitability for prototype or production planning. InventSmith work is not production-release engineering until required review is accepted.",
};

const REGULATORY_REVIEW: RequiredProfessionalReview = {
  specialty: "regulatory",
  requiredCredentials: "Qualified regulatory or compliance professional familiar with the product category and intended sales jurisdictions",
  scope: "Confirm applicable regulations, standards, testing, certification, labeling, and jurisdiction-specific obligations. InventSmith provides screening, not a compliance conclusion.",
};

const FINANCE_REVIEW: RequiredProfessionalReview = {
  specialty: "finance",
  requiredCredentials: "Qualified accountant, finance professional, lender/grant specialist, or securities counsel as appropriate to the contemplated funding action",
  scope: "Review financial assumptions, entity/tax/accounting implications, funding structure, disclosures, securities or lending consequences, and suitability of projections for external authorized use.",
};

const SOFTWARE_SECURITY_REVIEW: RequiredProfessionalReview = {
  specialty: "other",
  requiredCredentials: "Qualified application-security/privacy professional with experience appropriate to the product's data sensitivity, threat model, platforms, integrations, and regulated context",
  scope: "Review authentication/authorization, sensitive-data handling, threat model, dependency/integration risk, privacy/retention/deletion controls, incident readiness, security testing, and any regulated privacy/security obligations. InventSmith preparation is not a penetration test, certification, privacy legal opinion, or compliance approval.",
};

export function requiredProfessionalReviews(kind: string): RequiredProfessionalReview[] {
  if ([
    "preliminary_prior_art_landscape",
    "feature_prior_art_comparison",
    "ip_readiness_brief",
    "ip_strategy_plan",
    "invention_disclosure_package",
    "trademark_preliminary_screen",
    "legal_professional_handoff",
  ].includes(kind)) return [PATENT_REVIEW];

  if ([
    "nda_draft_package",
    "inventor_contracting_package",
    "manufacturing_agreement_checklist",
  ].includes(kind)) return [CONTRACTS_REVIEW];

  if ([
    "technical_feasibility_assessment",
    "preliminary_bom_cost_range",
    "engineering_handoff_brief",
    "product_design_specification",
    "cad_model_specification",
    "manufacturing_drawing_specification",
    "prototype_test_report",
    "prototype_to_spec_gap_analysis",
    "prototype_readiness_assessment",
    "manufacturing_process_plan",
    "manufacturer_rfq_package",
    "manufacturing_readiness_assessment",
  ].includes(kind)) return [ENGINEERING_REVIEW];

  if (kind === "regulatory_readiness_screening") return [REGULATORY_REVIEW];
  if (kind === "software_security_privacy_readiness") return [SOFTWARE_SECURITY_REVIEW];

  if (["financial_model", "funding_readiness_assessment"].includes(kind)) return [FINANCE_REVIEW];

  if (kind === "invention_feasibility_development_package") return [PATENT_REVIEW, ENGINEERING_REVIEW, REGULATORY_REVIEW];
  return [];
}
