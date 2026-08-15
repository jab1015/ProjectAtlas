export interface CanonicalWorkPlanItem {
  kind: string;
  title: string;
  priority: number;
  estimatedCostUnits?: number;
  deliverableKind?: string;
  dependsOnKinds?: string[];
  initiallyCompleted?: boolean;
}

export const CANONICAL_WORK_PLAN: readonly CanonicalWorkPlanItem[] = [
  {
    kind: "idea_capture",
    title: "Capture the invention brief",
    priority: 100,
    initiallyCompleted: true,
  },
  {
    kind: "brief_analysis",
    title: "Analyze the invention brief",
    priority: 90,
    estimatedCostUnits: 8,
    deliverableKind: "invention_brief_analysis",
  },
  {
    kind: "competitor_discovery",
    title: "Research competing products and alternatives",
    priority: 80,
    estimatedCostUnits: 15,
    deliverableKind: "competitor_landscape",
  },
  {
    kind: "assumptions_unknowns",
    title: "Build the assumptions and unknowns register",
    priority: 75,
    estimatedCostUnits: 8,
    deliverableKind: "assumptions_unknowns_register",
    dependsOnKinds: ["brief_analysis"],
  },
  {
    kind: "market_feasibility",
    title: "Assess market feasibility and demand signals",
    priority: 70,
    estimatedCostUnits: 15,
    deliverableKind: "market_feasibility_report",
    dependsOnKinds: ["brief_analysis", "competitor_discovery"],
  },
  {
    kind: "preliminary_prior_art",
    title: "Build a preliminary prior-art landscape",
    priority: 65,
    estimatedCostUnits: 18,
    deliverableKind: "preliminary_prior_art_landscape",
    dependsOnKinds: ["brief_analysis"],
  },
  {
    kind: "technical_feasibility",
    title: "Assess technical feasibility and product risks",
    priority: 60,
    estimatedCostUnits: 12,
    deliverableKind: "technical_feasibility_assessment",
    dependsOnKinds: ["brief_analysis"],
  },
  {
    kind: "feature_prior_art_comparison",
    title: "Compare proposed features with the prior-art landscape",
    priority: 58,
    estimatedCostUnits: 12,
    deliverableKind: "feature_prior_art_comparison",
    dependsOnKinds: ["preliminary_prior_art", "technical_feasibility"],
  },
  {
    kind: "distinguishing_features",
    title: "Develop distinguishing feature hypotheses and alternative embodiments",
    priority: 56,
    estimatedCostUnits: 10,
    deliverableKind: "distinguishing_features_alternative_embodiments",
    dependsOnKinds: ["feature_prior_art_comparison"],
  },
  {
    kind: "materials_manufacturing",
    title: "Research materials and manufacturing approaches",
    priority: 50,
    estimatedCostUnits: 15,
    deliverableKind: "materials_manufacturing_assessment",
    dependsOnKinds: ["technical_feasibility", "preliminary_prior_art"],
  },
  {
    kind: "product_requirements",
    title: "Draft the initial product requirements",
    priority: 48,
    estimatedCostUnits: 12,
    deliverableKind: "initial_product_requirements",
    dependsOnKinds: ["market_feasibility", "technical_feasibility", "distinguishing_features"],
  },
  {
    kind: "regulatory_screening",
    title: "Screen potentially applicable regulatory requirements",
    priority: 45,
    estimatedCostUnits: 15,
    deliverableKind: "regulatory_readiness_screening",
    dependsOnKinds: ["technical_feasibility"],
  },
  {
    kind: "design_directions",
    title: "Prepare preliminary product design directions",
    priority: 43,
    estimatedCostUnits: 14,
    deliverableKind: "product_design_directions",
    dependsOnKinds: ["product_requirements", "materials_manufacturing"],
  },
  {
    kind: "preliminary_bom_cost",
    title: "Prepare a preliminary bill of materials and cost range",
    priority: 42,
    estimatedCostUnits: 14,
    deliverableKind: "preliminary_bom_cost_range",
    dependsOnKinds: ["product_requirements", "materials_manufacturing"],
  },
  {
    kind: "concept_image_generation",
    title: "Generate a concept visualization board",
    priority: 41,
    estimatedCostUnits: 30,
    deliverableKind: "concept_visualization_board",
    dependsOnKinds: ["design_directions"],
  },
  {
    kind: "ip_readiness",
    title: "Prepare the patent-professional readiness brief",
    priority: 40,
    estimatedCostUnits: 12,
    deliverableKind: "ip_readiness_brief",
    dependsOnKinds: ["preliminary_prior_art", "technical_feasibility"],
  },
  {
    kind: "development_risks",
    title: "Map development risks, costs, and dependencies",
    priority: 38,
    estimatedCostUnits: 10,
    deliverableKind: "development_risks_costs_dependencies",
    dependsOnKinds: ["market_feasibility", "preliminary_bom_cost", "regulatory_screening"],
  },
  {
    kind: "engineering_handoff",
    title: "Prepare the engineering professional handoff brief",
    priority: 36,
    estimatedCostUnits: 10,
    deliverableKind: "engineering_handoff_brief",
    dependsOnKinds: ["product_requirements", "preliminary_bom_cost", "development_risks"],
  },
  {
    kind: "evidence_verification",
    title: "Verify material sources and claim support",
    priority: 35,
    estimatedCostUnits: 18,
    deliverableKind: "evidence_verification_report",
    dependsOnKinds: ["assumptions_unknowns", "ip_readiness", "development_risks"],
  },
  {
    kind: "feasibility_recommendation",
    title: "Prepare the proceed, revise, pause, or stop recommendation",
    priority: 30,
    estimatedCostUnits: 10,
    deliverableKind: "feasibility_recommendation",
    dependsOnKinds: ["ip_readiness", "evidence_verification"],
  },
  {
    kind: "package_assembly",
    title: "Assemble the invention feasibility and development package",
    priority: 20,
    estimatedCostUnits: 16,
    deliverableKind: "invention_feasibility_development_package",
    dependsOnKinds: ["feasibility_recommendation"],
  },
] as const;

export function missingCanonicalWorkKinds(existingKinds: Iterable<string>) {
  const existing = new Set(existingKinds);
  return CANONICAL_WORK_PLAN.filter((item) => !existing.has(item.kind));
}
