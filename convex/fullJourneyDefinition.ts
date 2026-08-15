export interface FullJourneyStageDefinition {
  id: number;
  name: string;
  routeType: "foundation" | "design" | "department";
  requiredWorkKinds: string[];
  dependsOnStageIds: number[];
}

export const FULL_JOURNEY_STAGES: FullJourneyStageDefinition[] = [
  { id: 1, name: "Idea", routeType: "foundation", requiredWorkKinds: ["idea_capture"], dependsOnStageIds: [] },
  { id: 2, name: "Validation", routeType: "foundation", requiredWorkKinds: ["assumptions_unknowns", "market_feasibility"], dependsOnStageIds: [1] },
  { id: 3, name: "Market Research", routeType: "foundation", requiredWorkKinds: ["competitor_discovery", "market_feasibility"], dependsOnStageIds: [1, 2] },
  { id: 4, name: "Patent Readiness", routeType: "foundation", requiredWorkKinds: ["preliminary_prior_art", "feature_prior_art_comparison", "distinguishing_features", "ip_readiness", "patent_design_handoff"], dependsOnStageIds: [1, 2, 3] },
  { id: 5, name: "Product Design + CAD", routeType: "design", requiredWorkKinds: ["design_candidate_generation", "design_candidate_scoring", "product_design_specification", "cad_model_specification", "exploded_view_specification", "manufacturing_drawing_specification", "native_cad_generation"], dependsOnStageIds: [2, 3, 4] },
  { id: 6, name: "Prototype", routeType: "department", requiredWorkKinds: ["prototype_strategy", "prototype_sourcing_plan", "prototype_test_plan", "prototype_evidence_assessment", "prototype_design_gap_analysis", "prototype_readiness"], dependsOnStageIds: [5] },
  { id: 7, name: "Manufacturing", routeType: "department", requiredWorkKinds: ["manufacturing_process_plan", "factory_requirements", "manufacturer_sourcing", "manufacturer_rfq_package", "manufacturer_scorecard", "manufacturing_unit_economics", "manufacturer_quote_comparison", "manufacturing_agreement_checklist", "manufacturing_readiness"], dependsOnStageIds: [5, 6] },
  { id: 8, name: "Branding", routeType: "department", requiredWorkKinds: ["brand_positioning", "product_name_candidates", "trademark_preliminary_screen", "brand_identity_system", "brand_asset_brief"], dependsOnStageIds: [2, 3, 5] },
  { id: 9, name: "Intellectual Property / Legal", routeType: "department", requiredWorkKinds: ["ip_strategy_plan", "invention_disclosure_package", "nda_draft_package", "contracting_package", "ip_status_tracker", "professional_legal_handoff", "professional_service_plan", "professional_provider_research"], dependsOnStageIds: [4, 5, 7] },
  { id: 10, name: "Pricing", routeType: "department", requiredWorkKinds: ["pricing_evidence", "pricing_strategy", "break_even_analysis", "pricing_validation_plan"], dependsOnStageIds: [3, 7] },
  { id: 11, name: "Marketing", routeType: "department", requiredWorkKinds: ["marketing_messaging", "marketing_channel_strategy", "marketing_plan", "marketing_asset_package", "prelaunch_marketing_calendar"], dependsOnStageIds: [3, 8, 10] },
  { id: 12, name: "Sales", routeType: "department", requiredWorkKinds: ["sales_channel_strategy", "sales_toolkit", "sales_funnel_model", "sales_projection", "post_purchase_experience"], dependsOnStageIds: [7, 10, 11] },
  { id: 13, name: "Funding", routeType: "department", requiredWorkKinds: ["funding_strategy", "funding_source_research", "financial_model", "pitch_deck_content", "investor_faq", "funding_readiness"], dependsOnStageIds: [3, 5, 7, 8, 9, 10] },
  { id: 14, name: "Launch", routeType: "department", requiredWorkKinds: ["launch_readiness", "launch_playbook", "customer_feedback_loop", "launch_performance", "post_launch_priorities"], dependsOnStageIds: [7, 8, 9, 10, 11, 12] },
  { id: 15, name: "Growth", routeType: "department", requiredWorkKinds: ["growth_audit", "growth_levers", "growth_roadmap", "retention_system", "growth_performance_reporting"], dependsOnStageIds: [14] },
];

export function routeForJourneyStage(inventionId: string, stage: FullJourneyStageDefinition): string {
  if (stage.routeType === "design") return `/invention/${inventionId}/design`;
  if (stage.routeType === "department") return `/invention/${inventionId}/department/${stage.id}`;
  return `/invention/${inventionId}`;
}
