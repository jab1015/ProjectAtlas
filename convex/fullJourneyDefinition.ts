export interface FullJourneyStageDefinition {
  id: number;
  name: string;
  routeType: "foundation" | "design" | "department";
  requiredWorkKinds: string[];
}

export const FULL_JOURNEY_STAGES: FullJourneyStageDefinition[] = [
  { id: 1, name: "Idea", routeType: "foundation", requiredWorkKinds: ["idea_capture"] },
  { id: 2, name: "Validation", routeType: "foundation", requiredWorkKinds: ["assumptions_unknowns", "market_feasibility"] },
  { id: 3, name: "Market Research", routeType: "foundation", requiredWorkKinds: ["competitor_discovery", "market_feasibility"] },
  { id: 4, name: "Patent Readiness", routeType: "foundation", requiredWorkKinds: ["preliminary_prior_art", "feature_prior_art_comparison", "ip_readiness"] },
  { id: 5, name: "Product Design + CAD", routeType: "design", requiredWorkKinds: ["design_candidate_generation", "design_candidate_scoring", "product_design_specification", "cad_model_specification", "exploded_view_specification", "manufacturing_drawing_specification", "native_cad_generation"] },
  { id: 6, name: "Prototype", routeType: "department", requiredWorkKinds: ["prototype_strategy", "prototype_sourcing_plan", "prototype_test_plan", "prototype_evidence_assessment", "prototype_design_gap_analysis", "prototype_readiness"] },
  { id: 7, name: "Manufacturing", routeType: "department", requiredWorkKinds: ["manufacturing_process_plan", "factory_requirements", "manufacturer_sourcing", "manufacturer_rfq_package", "manufacturer_scorecard", "manufacturing_unit_economics", "manufacturer_quote_comparison", "manufacturing_agreement_checklist", "manufacturing_readiness"] },
  { id: 8, name: "Branding", routeType: "department", requiredWorkKinds: ["brand_positioning", "product_name_candidates", "trademark_preliminary_screen", "brand_identity_system", "brand_asset_brief"] },
  { id: 9, name: "Intellectual Property / Legal", routeType: "department", requiredWorkKinds: ["ip_strategy_plan", "invention_disclosure_package", "nda_draft_package", "contracting_package", "ip_status_tracker", "professional_legal_handoff"] },
  { id: 10, name: "Pricing", routeType: "department", requiredWorkKinds: ["pricing_evidence", "pricing_strategy", "break_even_analysis", "pricing_validation_plan"] },
  { id: 11, name: "Marketing", routeType: "department", requiredWorkKinds: ["marketing_messaging", "marketing_channel_strategy", "marketing_plan", "marketing_asset_package", "prelaunch_marketing_calendar"] },
  { id: 12, name: "Sales", routeType: "department", requiredWorkKinds: ["sales_channel_strategy", "sales_toolkit", "sales_funnel_model", "sales_projection", "post_purchase_experience"] },
  { id: 13, name: "Funding", routeType: "department", requiredWorkKinds: ["funding_strategy", "funding_source_research", "financial_model", "pitch_deck_content", "investor_faq", "funding_readiness"] },
  { id: 14, name: "Launch", routeType: "department", requiredWorkKinds: ["launch_readiness", "launch_playbook", "customer_feedback_loop", "launch_performance", "post_launch_priorities"] },
  { id: 15, name: "Growth", routeType: "department", requiredWorkKinds: ["growth_audit", "growth_levers", "growth_roadmap", "retention_system", "growth_performance_reporting"] },
];

export function routeForJourneyStage(inventionId: string, stage: FullJourneyStageDefinition): string {
  if (stage.routeType === "design") return `/invention/${inventionId}/design`;
  if (stage.routeType === "department") return `/invention/${inventionId}/department/${stage.id}`;
  return `/invention/${inventionId}`;
}
