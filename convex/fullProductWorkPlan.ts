import { DESIGN_WORK } from "./productDesign";
import { lifecycleStages } from "./lifecycleDepartments";

export interface FullProductWorkPlanItem {
  kind: string;
  title: string;
  priority: number;
  estimatedCostUnits: number;
  deliverableKind: string;
  dependsOnKinds: string[];
  inputSnapshot: Record<string, unknown>;
}

const designWork: FullProductWorkPlanItem[] = DESIGN_WORK.map((item) => ({
  kind: item.kind,
  title: item.title,
  priority: item.priority,
  estimatedCostUnits: item.estimatedCostUnits,
  deliverableKind: item.deliverableKind,
  dependsOnKinds: [...item.dependsOnKinds],
  inputSnapshot: {
    department: "product_design",
    instructions: item.instructions,
  },
}));

const nativeCadWork: FullProductWorkPlanItem = {
  kind: "native_cad_generation",
  title: "Generate native STEP, STL, DXF and editable CAD source",
  priority: 63,
  estimatedCostUnits: 18,
  deliverableKind: "native_cad_package",
  dependsOnKinds: ["product_design_specification", "cad_model_specification", "manufacturing_drawing_specification"],
  inputSnapshot: {
    department: "product_design",
    executionMode: "native_cad",
    instructions: "Generate the next preliminary native CAD package automatically when the selected design, CAD specification, and drawing requirements are ready. Produce STEP/STL/DXF/editable source plus orthographic and exploded views. Preserve every unresolved engineering assumption and require qualified engineering/prototype review before manufacturing release.",
  },
};

const prototypeEvidenceGate: FullProductWorkPlanItem = {
  kind: "prototype_physical_evidence",
  title: "Collect physical prototype test evidence",
  priority: 59.5,
  estimatedCostUnits: 1,
  deliverableKind: "prototype_physical_evidence_gate",
  dependsOnKinds: ["prototype_test_plan"],
  inputSnapshot: {
    department: "prototype",
    stageId: 6,
    physicalEvidenceGate: true,
    instructions: "This is a real-world evidence gate, not a writing assignment. Inspect inventor-provided evidence for actual prototype/test observations, measurements, photos, videos/transcripts, failure notes, or qualified professional test results tied to the current prototype. If no actual prototype evidence exists, do not synthesize or infer results: return needsHuman=true, humanGateType=physical_work, and ask for the smallest useful action—perform the planned prototype test and upload the resulting evidence. If actual prototype evidence is present, summarize only what is evidenced, preserve provenance and limitations, and allow the downstream prototype assessment to proceed. Never represent an unbuilt or untested prototype as tested.",
    research: false,
    professionalGate: null,
  },
};

const manufacturerQuoteEvidenceGate: FullProductWorkPlanItem = {
  kind: "manufacturer_quote_evidence",
  title: "Collect real manufacturer quote / RFQ evidence",
  priority: 50.5,
  estimatedCostUnits: 1,
  deliverableKind: "manufacturer_quote_evidence_gate",
  dependsOnKinds: ["manufacturer_rfq_package", "manufacturer_sourcing"],
  inputSnapshot: {
    department: "manufacturing",
    stageId: 7,
    externalEvidenceGate: true,
    instructions: "This is an external commercial evidence gate, not a request to fabricate a quote. Inspect inventor-provided evidence for one or more actual manufacturer/factory RFQ responses or quotations tied to the current design/revision. If no real quote evidence exists, return needsHuman=true, humanGateType=authorization, and ask for the smallest useful action: obtain at least one real quote/RFQ response and upload it to the Evidence Locker. Do not invent prices, MOQs, lead times, tooling, payment terms, certifications, or supplier commitments. If real quote evidence exists, summarize only the quoted scope and limitations so the downstream comparison can proceed.",
    research: false,
    professionalGate: null,
  },
};

const lifecycleWork: FullProductWorkPlanItem[] = lifecycleStages.flatMap((stage) =>
  stage.work.map((item) => ({
    kind: item.kind,
    title: item.title,
    priority: item.priority,
    estimatedCostUnits: item.estimatedCostUnits,
    deliverableKind: item.deliverableKind,
    dependsOnKinds: item.kind === "prototype_evidence_assessment"
      ? [...item.dependsOnKinds, "prototype_physical_evidence"]
      : item.kind === "manufacturer_quote_comparison"
        ? [...item.dependsOnKinds, "manufacturer_quote_evidence"]
        : [...item.dependsOnKinds],
    inputSnapshot: {
      department: stage.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
      stageId: stage.id,
      instructions: item.instructions,
      research: item.research === true,
      professionalGate: item.professionalGate ?? null,
    },
  }))
);

const professionalRoutingWork: FullProductWorkPlanItem[] = [
  {
    kind: "professional_service_plan",
    title: "Determine which outside professionals and services the inventor needs",
    priority: 37,
    estimatedCostUnits: 10,
    deliverableKind: "professional_service_plan",
    dependsOnKinds: ["engineering_handoff", "ip_readiness", "regulatory_screening", "factory_requirements"],
    inputSnapshot: {
      department: "intellectual_property_legal",
      stageId: 9,
      instructions: "Build a timed professional-service plan from the actual invention record. Identify only specialties justified by the evidence and current journey state, such as patent attorney/agent, trademark counsel, product or industrial designer, mechanical/electrical/firmware engineer, materials specialist, regulatory consultant, testing/certification laboratory, prototype service, factory/tooling provider, packaging specialist, logistics provider, accountant/tax professional, insurance professional, branding/marketing specialist, retail/distribution specialist, grant specialist, lender or investor category. For each needed specialty explain why it is needed, when to engage, what decision depends on it, what InventSmith has already prepared, exactly what to send, questions to ask, credentials/capabilities to verify, expected engagement scope, and red flags. Do not create unnecessary human work when InventSmith can complete the task itself. Do not contact, hire, share confidential information, spend money, file, or commit on the inventor's behalf.",
      research: false,
      professionalGate: null,
    },
  },
  {
    kind: "professional_provider_research",
    title: "Research evidence-backed candidate professionals and service providers",
    priority: 36,
    estimatedCostUnits: 18,
    deliverableKind: "professional_provider_candidate_report",
    dependsOnKinds: ["professional_service_plan", "manufacturer_sourcing", "professional_legal_handoff"],
    inputSnapshot: {
      department: "intellectual_property_legal",
      stageId: 9,
      instructions: "Using the professional-service plan and invention requirements, research specific candidate providers where credible public evidence permits. Prioritize authoritative professional directories, official firm/provider pages, accreditation or certification sources, relevant technical capabilities, geography/jurisdiction fit when known, and demonstrated service scope. For each candidate state the evidence for fit, source URLs, what still must be verified, and why the candidate may or may not match this invention. Include appropriate alternatives rather than implying endorsement. Never fabricate availability, price, credentials, licensing, success rate, or experience. If a user's jurisdiction or location is genuinely necessary and absent from the invention record, identify that as the smallest missing input rather than guessing. Do not contact anyone, disclose confidential invention material, hire, purchase, or commit without inventor approval.",
      research: true,
      professionalGate: null,
    },
  },
];

export const POST_CANONICAL_WORK_PLAN: readonly FullProductWorkPlanItem[] = [
  ...designWork,
  nativeCadWork,
  prototypeEvidenceGate,
  manufacturerQuoteEvidenceGate,
  ...lifecycleWork,
  ...professionalRoutingWork,
];

export const FULL_PRODUCT_AUTONOMOUS_WORK_KINDS = new Set(POST_CANONICAL_WORK_PLAN.map((item) => item.kind));
