export type ReviewSpecialty = "patent" | "contracts" | "engineering" | "regulatory" | "finance" | "other";

export interface RequiredProfessionalReview {
  specialty: ReviewSpecialty;
  requiredCredentials: string;
  scope: string;
}

const PATENT_REVIEW: RequiredProfessionalReview = {
  specialty: "patent",
  requiredCredentials: "Licensed patent attorney or registered patent agent appropriate to the jurisdiction and scope",
  scope: "Review search coverage, prior-art relevance, distinguishing-feature hypotheses, claim implications, disclosure, and legal next steps. No Atlas output is a patentability or freedom-to-operate opinion.",
};

const ENGINEERING_REVIEW: RequiredProfessionalReview = {
  specialty: "engineering",
  requiredCredentials: "Qualified product-development engineer with experience relevant to the mechanism, materials, manufacturing process, and risk category",
  scope: "Review requirements, mechanisms, materials, tolerances, failure modes, tests, cost assumptions, and suitability for prototype planning. Atlas work is not production-release engineering.",
};

const REGULATORY_REVIEW: RequiredProfessionalReview = {
  specialty: "regulatory",
  requiredCredentials: "Qualified regulatory or compliance professional familiar with the product category and intended sales jurisdictions",
  scope: "Confirm applicable regulations, standards, testing, certification, labeling, and jurisdiction-specific obligations. Atlas provides screening, not a compliance conclusion.",
};

export function requiredProfessionalReviews(kind: string): RequiredProfessionalReview[] {
  if (["preliminary_prior_art_landscape", "feature_prior_art_comparison", "ip_readiness_brief"].includes(kind)) return [PATENT_REVIEW];
  if (["technical_feasibility_assessment", "preliminary_bom_cost_range", "engineering_handoff_brief"].includes(kind)) return [ENGINEERING_REVIEW];
  if (kind === "regulatory_readiness_screening") return [REGULATORY_REVIEW];
  if (kind === "invention_feasibility_development_package") return [PATENT_REVIEW, ENGINEERING_REVIEW, REGULATORY_REVIEW];
  return [];
}
