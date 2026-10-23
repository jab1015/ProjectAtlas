export interface DepartmentAgentProfile {
  department: string;
  agentId: string;
  name: string;
  mission: string;
  guardrails: readonly string[];
}

const SHARED_GUARDRAILS = [
  "Use the canonical invention record and traceable evidence; do not silently upgrade drafts, estimates, or inventor statements into verified facts.",
  "Stay inside this department's scope and create an explicit handoff when another department owns the next decision.",
  "Never claim professional approval, regulatory compliance, patentability, factory release, payment, external contact, or real-world completion without the required evidence and authorization.",
] as const;

function profile(department: string, name: string, mission: string, guardrails: readonly string[] = []): DepartmentAgentProfile {
  return {
    department,
    agentId: `inventsmith.department.${department}.v1`,
    name,
    mission,
    guardrails: [...SHARED_GUARDRAILS, ...guardrails],
  };
}

export const DEPARTMENT_AGENT_PROFILES = {
  idea: profile("idea", "Invention Idea Agent", "Clarify the inventor's problem, intended user, mechanism, constraints, and the highest-value unknowns before downstream work begins."),
  validation: profile("validation", "Validation Agent", "Evaluate the problem and solution hypotheses against inventor-provided evidence, preserve sample and provenance details, and identify the next evidence that would change the decision."),
  market_research: profile("market_research", "Market Research Agent", "Research customers, alternatives, competitors, market evidence, and demand while keeping sourced observations separate from estimates and hypotheses."),
  canonical: profile("canonical", "Discovery & Feasibility Agent", "Turn the initial invention brief into an evidence-backed problem, market, technical, regulatory, and risk foundation."),
  patent_readiness: profile("patent_readiness", "Patent Readiness Agent", "Prepare preliminary prior-art analysis, distinguishing-feature hypotheses, and a traceable handoff for qualified patent professionals.", ["Provide preliminary research and preparation only; never give a patentability or freedom-to-operate opinion."]),
  product_design: profile("product_design", "Product Design & CAD Agent", "Translate validated requirements into product directions, specifications, preliminary CAD, drawings, BOM hypotheses, and engineering-review packages.", ["Keep CAD and engineering outputs preliminary until the required prototype and qualified-engineering evidence exists."]),
  prototype: profile("prototype", "Prototype Agent", "Plan the smallest useful physical validation sequence, define measurable tests, and assess only real uploaded prototype evidence."),
  manufacturing: profile("manufacturing", "Manufacturing Agent", "Prepare process, factory, sourcing, RFQ, quote-comparison, quality, unit-economics, and manufacturing-readiness work.", ["Do not contact suppliers, disclose invention material, select a factory, place an order, or declare manufacturing release without the exact approvals and maturity gates."]),
  branding: profile("branding", "Branding Agent", "Develop evidence-backed positioning, naming directions, preliminary trademark screening, identity systems, and asset-production briefs."),
  intellectual_property_legal: profile("intellectual_property_legal", "IP & Legal Preparation Agent", "Prepare inventor-controlled IP strategy, disclosure, contract checklists, status tracking, and professional legal handoffs.", ["Draft preparation is not legal advice or clearance; preserve every attorney-review gate."]),
  pricing: profile("pricing", "Pricing Agent", "Convert cost, customer-value, competitor, and channel evidence into testable pricing and margin scenarios."),
  marketing: profile("marketing", "Marketing Agent", "Build claims-safe messaging, channel strategy, launch plans, assets, and calendars grounded in validated customer evidence."),
  sales: profile("sales", "Sales Agent", "Design sales channels, buyer tools, funnel models, forecasts, and post-purchase systems without inventing demand or commitments."),
  funding: profile("funding", "Funding Agent", "Prepare defensible funding strategy, financial models, source research, pitch materials, and readiness assessments."),
  launch: profile("launch", "Launch Agent", "Coordinate launch readiness and playbooks, then evaluate only actual launch, sales, fulfillment, and customer evidence."),
  growth: profile("growth", "Growth Agent", "Diagnose real post-launch performance and propose evidence-driven retention, expansion, and operating improvements."),
  software_product_design: profile("software_product_design", "Software Product Design Agent", "Define evidence-backed software requirements, product scope, user journeys, and accessible interaction flows."),
  software_engineering: profile("software_engineering", "Software Engineering Agent", "Design implementation-ready architecture, data/API contracts, and security/privacy readiness with explicit specialist gates."),
  software_prototype_build: profile("software_prototype_build", "Software Prototype Agent", "Plan the smallest useful working prototype and a sequenced implementation path that tests the highest-risk assumptions."),
  software_engineering_release: profile("software_engineering_release", "Software Release Agent", "Define evidence-based QA, beta, distribution, monitoring, rollout, and rollback readiness without claiming unexecuted tests or deployment."),
  regulatory: profile("regulatory", "Regulatory Screening Agent", "Screen potentially applicable regulatory, safety, labeling, testing, and certification requirements and prepare traceable questions for qualified specialists."),
} as const satisfies Record<string, DepartmentAgentProfile>;

export type DepartmentAgentKey = keyof typeof DEPARTMENT_AGENT_PROFILES;

export function isDepartmentAgentKey(value: unknown): value is DepartmentAgentKey {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(DEPARTMENT_AGENT_PROFILES, value);
}

/** Convert a lifecycle stage's display label into its registered agent key. */
export function departmentAgentKeyFromDisplayName(name: string): DepartmentAgentKey {
  const key = name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  if (!isDepartmentAgentKey(key)) {
    throw new Error(`Lifecycle department has no registered agent: ${name}`);
  }
  return key;
}

const WORK_KIND_DEPARTMENT: Readonly<Record<string, DepartmentAgentKey>> = {
  idea_capture: "idea",
  brief_analysis: "idea",
  assumptions_unknowns: "idea",
  competitor_discovery: "market_research",
  market_feasibility: "market_research",
  // The original feasibility work item predates department metadata. Keep it
  // on the dedicated discovery/feasibility agent when a retry reconstructs it.
  technical_feasibility: "canonical",
  // Legacy canonical jobs can still be retried from Support; preserve the
  // department identity they should run under when snapshots lack metadata.
  product_requirements: "product_design",
  materials_manufacturing: "manufacturing",
  // Some early records stored the deliverable kind rather than the work kind.
  // Keep those records recoverable through the same bounded retry path.
  materials_manufacturing_assessment: "manufacturing",
  manufacturing_research: "manufacturing",
  materials_manufacturing_research: "manufacturing",
  materials_manufacturing_approaches: "manufacturing",
  preliminary_bom_cost: "manufacturing",
  preliminary_prior_art: "patent_readiness",
  feature_prior_art_comparison: "patent_readiness",
  distinguishing_features: "patent_readiness",
  patent_design_handoff: "patent_readiness",
  ip_readiness: "patent_readiness",
  regulatory_screening: "regulatory",
};

export function resolveDepartmentAgent(inputSnapshot: unknown, workKind?: string): DepartmentAgentProfile {
  const input = inputSnapshot && typeof inputSnapshot === "object" ? inputSnapshot as Record<string, unknown> : null;
  const declaredDepartment = input?.department;
  // A few early work rows stored human-readable labels (for example,
  // "materials manufacturing" or "preliminary bom cost") instead of the
  // canonical snake_case kind. Normalize those legacy values before routing.
  const normalizedWorkKind = typeof workKind === "string"
    ? workKind.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
    : undefined;
  // Older canonical jobs carried a single umbrella label. Route those by their
  // actual assignment so each department gets its own mission and audit identity.
  const department = (declaredDepartment === "canonical" || !isDepartmentAgentKey(declaredDepartment)) && normalizedWorkKind && WORK_KIND_DEPARTMENT[normalizedWorkKind]
    ? WORK_KIND_DEPARTMENT[normalizedWorkKind]
    : declaredDepartment;
  if (!isDepartmentAgentKey(department)) {
    throw new Error(`Work item is missing a registered department agent: ${String(department ?? "unknown")}`);
  }
  return DEPARTMENT_AGENT_PROFILES[department];
}

export function departmentAgentSystemPrompt(agent: DepartmentAgentProfile): string {
  return [
    `You are ${agent.name}, the dedicated InventSmith AI agent for the ${agent.department} department.`,
    `Stable agent identity: ${agent.agentId}.`,
    `Department mission: ${agent.mission}`,
    ...agent.guardrails.map((guardrail) => `Guardrail: ${guardrail}`),
  ].join(" ");
}

/** A repaired registration gets one recovery window, separate from provider retries. */
export function canRecoverAgentAssignment(inputSnapshot: Record<string, unknown> | undefined, workKind: string | undefined, lastError: string | undefined): boolean {
  if (!lastError?.includes("missing a registered department agent") || inputSnapshot?.departmentAgentRecoveryVersion !== undefined) return false;
  try {
    resolveDepartmentAgent(inputSnapshot, workKind);
    return true;
  } catch {
    return false;
  }
}

export function departmentAgentAuditMetadata(inputSnapshot: unknown, workKind?: string) {
  const input = inputSnapshot && typeof inputSnapshot === "object" ? inputSnapshot as Record<string, unknown> : null;
  const declaredDepartment = input?.department;
  const normalizedWorkKind = typeof workKind === "string"
    ? workKind.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
    : undefined;
  const department = (declaredDepartment === "canonical" || !isDepartmentAgentKey(declaredDepartment)) && normalizedWorkKind && WORK_KIND_DEPARTMENT[normalizedWorkKind]
    ? WORK_KIND_DEPARTMENT[normalizedWorkKind]
    : declaredDepartment;
  if (!isDepartmentAgentKey(department)) return { departmentAgentRegistered: false, department: typeof department === "string" ? department : undefined };
  const agent = DEPARTMENT_AGENT_PROFILES[department];
  return { departmentAgentRegistered: true, department: agent.department, departmentAgentId: agent.agentId, departmentAgentName: agent.name };
}
