export interface OperationalWorkItem {
  kind: string;
  status: string;
  dependsOnKinds?: string[];
  blockedReason?: string;
  lastError?: string;
  updatedAt?: number;
}

export type PatentDesignHandoffState =
  | "not_initialized"
  | "patent_work_incomplete"
  | "handoff_queued"
  | "handoff_running"
  | "handoff_blocked"
  | "handed_off"
  | "design_working"
  | "design_blocked"
  | "design_complete";

const PATENT_HANDOFF_PREREQUISITES = [
  "preliminary_prior_art",
  "feature_prior_art_comparison",
  "distinguishing_features",
  "ip_readiness",
] as const;

const DESIGN_PIPELINE = [
  "design_candidate_generation",
  "design_candidate_scoring",
  "product_design_specification",
  "cad_model_specification",
  "exploded_view_specification",
  "manufacturing_drawing_specification",
  "native_cad_generation",
  "product_render_generation",
] as const;

function workMap(workItems: OperationalWorkItem[]) {
  return new Map(workItems.map((item) => [item.kind, item]));
}

function statusFor(map: Map<string, OperationalWorkItem>, kind: string) {
  return map.get(kind)?.status ?? "not_initialized";
}

function incompleteDependencies(map: Map<string, OperationalWorkItem>, kinds: readonly string[]) {
  return kinds.filter((kind) => statusFor(map, kind) !== "completed");
}

export function summarizePatentDesignHandoff(workItems: OperationalWorkItem[]) {
  const map = workMap(workItems);
  const handoff = map.get("patent_design_handoff");
  const patentPrerequisitesMissing = incompleteDependencies(map, PATENT_HANDOFF_PREREQUISITES);
  const designItems = DESIGN_PIPELINE.map((kind) => map.get(kind)).filter(Boolean) as OperationalWorkItem[];
  const designRunning = designItems.filter((item) => item.status === "running").map((item) => item.kind);
  const designQueued = designItems.filter((item) => item.status === "queued").map((item) => item.kind);
  const designBlocked = designItems.filter((item) => item.status === "blocked" || item.status === "awaiting_approval").map((item) => item.kind);
  const designCompleted = designItems.filter((item) => item.status === "completed").map((item) => item.kind);

  let state: PatentDesignHandoffState;
  if (!handoff && patentPrerequisitesMissing.length === PATENT_HANDOFF_PREREQUISITES.length) state = "not_initialized";
  else if (patentPrerequisitesMissing.length > 0 && handoff?.status !== "completed") state = "patent_work_incomplete";
  else if (!handoff || handoff.status === "queued") state = "handoff_queued";
  else if (handoff.status === "running") state = "handoff_running";
  else if (["blocked", "awaiting_approval", "failed", "stale"].includes(handoff.status)) state = "handoff_blocked";
  else if (designBlocked.length > 0) state = "design_blocked";
  else if (designRunning.length > 0) state = "design_working";
  else if (designItems.length > 0 && designItems.every((item) => item.status === "completed")) state = "design_complete";
  else state = "handed_off";

  return {
    state,
    operationalHandoffOccurred: handoff?.status === "completed",
    patentDesignHandoff: {
      status: handoff?.status ?? "not_initialized",
      blockedReason: handoff?.blockedReason ?? null,
      lastError: handoff?.lastError ?? null,
    },
    patentPrerequisites: Object.fromEntries(PATENT_HANDOFF_PREREQUISITES.map((kind) => [kind, statusFor(map, kind)])),
    patentPrerequisitesMissing,
    productDesign: {
      running: designRunning,
      queued: designQueued,
      blocked: designBlocked,
      completed: designCompleted,
      statuses: Object.fromEntries(DESIGN_PIPELINE.map((kind) => [kind, statusFor(map, kind)])),
    },
    explanation:
      state === "design_working"
        ? `Patent-to-design handoff is complete and Product Design is actively running: ${designRunning.join(", ")}.`
        : state === "handed_off"
          ? `Patent-to-design handoff is complete. Product Design has received the handoff; queued work: ${designQueued.join(", ") || "none"}.`
          : state === "design_complete"
            ? "Patent-to-design handoff is complete and the initialized Product Design pipeline is complete."
            : state === "design_blocked"
              ? `Patent-to-design handoff is complete, but Product Design is blocked at: ${designBlocked.join(", ")}.`
              : state === "patent_work_incomplete"
                ? `Patent-to-design handoff cannot complete yet because these prerequisite work items are not complete: ${patentPrerequisitesMissing.join(", ")}.`
                : state === "handoff_running"
                  ? "Patent Readiness is actively preparing the formal handoff to Product Design."
                  : state === "handoff_blocked"
                    ? `Patent-to-design handoff is blocked${handoff?.blockedReason ? `: ${handoff.blockedReason}` : "."}`
                    : state === "handoff_queued"
                      ? "Patent-to-design handoff is queued and will run after its prerequisites are complete."
                      : "The patent-to-design workflow has not been initialized yet.",
  };
}

export function summarizeKeyProjectOperations(workItems: OperationalWorkItem[]) {
  const map = workMap(workItems);
  const selectedKinds = [
    "market_feasibility",
    "preliminary_prior_art",
    "feature_prior_art_comparison",
    "ip_readiness",
    "patent_design_handoff",
    "design_candidate_generation",
    "design_candidate_scoring",
    "product_design_specification",
    "native_cad_generation",
    "prototype_readiness",
    "manufacturing_readiness",
    "professional_legal_handoff",
    "pitch_deck_content",
    "funding_readiness",
    "launch_readiness",
  ];

  return {
    patentToDesign: summarizePatentDesignHandoff(workItems),
    keyWorkStatuses: Object.fromEntries(selectedKinds.map((kind) => [kind, statusFor(map, kind)])),
    activeWork: workItems.filter((item) => item.status === "running").map((item) => item.kind),
    blockedWork: workItems
      .filter((item) => item.status === "blocked" || item.status === "awaiting_approval")
      .map((item) => ({ kind: item.kind, reason: item.blockedReason ?? null })),
    failedWork: workItems.filter((item) => item.status === "failed").map((item) => ({ kind: item.kind, error: item.lastError ?? null })),
  };
}
