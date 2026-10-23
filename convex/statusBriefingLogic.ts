import { canTierRunWorkKind, minimumTierForWorkKind } from "./entitlementPolicyLogic";

export interface BriefingWorkItem {
  kind?: string;
  title: string;
  status: string;
  updatedAt: number;
  dependsOnKinds?: string[];
  outputSummary?: string;
  blockedReason?: string;
}

export interface BriefingDecision {
  title: string;
  question: string;
  status: string;
  createdAt: number;
}

export interface BriefingApproval {
  summary: string;
  status: string;
  requestedAt: number;
}

export interface BriefingFinding {
  statement: string;
  status: string;
  confidence: number;
  updatedAt: number;
}

export interface StatusBriefingInput {
  workItems: BriefingWorkItem[];
  decisions: BriefingDecision[];
  approvals: BriefingApproval[];
  findings: BriefingFinding[];
  subscriptionTier?: unknown;
}

export interface StatusBriefing {
  completed: Array<{ title: string; summary?: string; completedAt: number }>;
  discoveries: Array<{ statement: string; confidence: number }>;
  needsInventor: Array<{
    type: "decision" | "approval" | "blocked_work";
    title: string;
    detail: string;
    requestedAt: number;
  }>;
  next: Array<{ title: string; status: "running" | "queued" | "locked" | "waiting"; requiredTier?: string; waitingFor?: string[] }>;
  currentWork?: {
    department: "Internal Legal";
    stage: "Patent Readiness";
    status: "running" | "queued" | "waiting" | "complete";
    progressPercent: number;
    completedTasks: number;
    totalTasks: number;
    detail: string;
    process: string;
    expectation: string;
  };
}

// These are research assignments InventSmith is expected to perform before
// requesting professional review or physical evidence. A stale blocked record
// must not be shown to the inventor as an action they need to complete.
export const AUTONOMOUS_RESEARCH_KINDS = new Set([
  "brief_analysis",
  "assumptions_unknowns",
  "competitor_discovery",
  "technical_feasibility",
  "materials_manufacturing",
  "evidence_verification",
  "preliminary_bom_cost",
  "preliminary_prior_art",
  "feature_prior_art_comparison",
  "distinguishing_features",
  "ip_readiness",
  "market_feasibility",
  "regulatory_screening",
  "design_candidate_generation",
]);

// Professional gates can be stored as blocked until a qualified reviewer
// records a decision, but they are not inventor actions.
export const PROFESSIONAL_REVIEW_GATE_KINDS = new Set([
  "patent_design_handoff",
]);

const PATENT_READINESS_KINDS = [
  "preliminary_prior_art",
  "feature_prior_art_comparison",
  "distinguishing_features",
  "ip_readiness",
  "patent_design_handoff",
] as const;

const PATENT_READINESS_KIND_SET = new Set<string>(PATENT_READINESS_KINDS);

function patentReadinessBriefing(workItems: BriefingWorkItem[]) {
  const patentItems = workItems.filter((item) => PATENT_READINESS_KIND_SET.has(item.kind ?? ""));
  if (!patentItems.length) return undefined;

  const completedTasks = patentItems.filter((item) => item.status === "completed").length;
  const totalTasks = PATENT_READINESS_KINDS.length;
  const handoff = patentItems.find((item) => item.kind === "patent_design_handoff");
  const running = patentItems.find((item) => item.status === "running");
  const queued = patentItems.find((item) => item.status === "queued");
  const waiting = handoff && (handoff.status === "blocked" || handoff.status === "awaiting_approval");
  const status = running ? "running" as const : waiting ? "waiting" as const : queued ? "queued" as const : completedTasks === totalTasks ? "complete" as const : "queued" as const;

  return {
    department: "Internal Legal" as const,
    stage: "Patent Readiness" as const,
    status,
    progressPercent: Math.round((completedTasks / totalTasks) * 100),
    completedTasks,
    totalTasks,
    detail: running
      ? "Internal Legal preparation agents are processing the patent-readiness packet."
      : waiting
        ? "The packet is ready for the Internal Legal review step; downstream design work remains paused until that disposition is recorded."
        : queued
          ? "Internal Legal preparation is queued and will be claimed automatically when the worker wakes."
          : "Internal Legal has finished preparing the patent-readiness packet.",
    process: "InventSmith prepares the prior-art comparison and design-around questions, Internal Legal reviews the packet, and only an accepted disposition can release Product Design.",
    expectation: "The next update will appear here when a Legal task is claimed, completed, returned for changes, or records its audit result. No inventor action is required.",
  };
}

// Older records may contain an open decision created before design-candidate
// generation became an autonomous InventSmith work item. Treat it as stale
// system state instead of asking the inventor to choose before candidates are
// generated and scored.
export function isAutonomousDecision(decision: { title?: string; question?: string }) {
  const title = decision.title?.trim().toLowerCase() ?? "";
  const question = decision.question?.trim().toLowerCase() ?? "";
  return title === "generate evidence-backed product design candidates"
    || title.includes("evidence-backed product design candidates")
    || question.includes("generate evidence-backed product design candidates");
}

const newestFirst = <T extends { updatedAt: number }>(items: T[]) =>
  [...items].sort((a, b) => b.updatedAt - a.updatedAt);

/**
 * Creates the four-part inventor briefing from authoritative backend state.
 * Keeping this pure makes the prioritisation rules independently testable.
 */
export function buildStatusBriefing(input: StatusBriefingInput): StatusBriefing {
  const completed = newestFirst(
    input.workItems.filter((item) => item.status === "completed")
  )
    .slice(0, 5)
    .map((item) => ({
      title: item.title,
      summary: item.outputSummary,
      completedAt: item.updatedAt,
    }));

  const discoveries = newestFirst(
    input.findings.filter(
      (finding) =>
        finding.status === "evidence_checked" && finding.confidence >= 0.5
    )
  )
    .slice(0, 5)
    .map((finding) => ({
      statement: finding.statement,
      confidence: finding.confidence,
    }));

  const pendingDecisions = input.decisions
    .filter((decision) => decision.status === "open" && !isAutonomousDecision(decision))
    .map((decision) => ({
      type: "decision" as const,
      title: decision.title,
      detail: decision.question,
      requestedAt: decision.createdAt,
    }));

  const pendingApprovals = input.approvals
    .filter((approval) => approval.status === "pending")
    .map((approval) => ({
      type: "approval" as const,
      title: "Approval required",
      detail: approval.summary,
      requestedAt: approval.requestedAt,
    }));

  const blockedWork = input.workItems
    .filter((item) => item.status === "blocked" && item.blockedReason && !AUTONOMOUS_RESEARCH_KINDS.has(item.kind ?? "") && !PROFESSIONAL_REVIEW_GATE_KINDS.has(item.kind ?? ""))
    .map((item) => ({
      type: "blocked_work" as const,
      title: item.title,
      detail: item.blockedReason!,
      requestedAt: item.updatedAt,
    }));

  const needsInventor = [...pendingDecisions, ...pendingApprovals, ...blockedWork]
    .sort((a, b) => a.requestedAt - b.requestedAt)
    .slice(0, 10);

  const completedKinds = new Set(input.workItems.filter((item) => item.status === "completed").map((item) => item.kind));
  const currentWork = patentReadinessBriefing(input.workItems);
  const next = [...input.workItems]
    .filter((item) => item.status === "running" || item.status === "queued")
    .sort((a, b) => {
      const aPatent = PATENT_READINESS_KIND_SET.has(a.kind ?? "");
      const bPatent = PATENT_READINESS_KIND_SET.has(b.kind ?? "");
      if (aPatent !== bPatent) return aPatent ? -1 : 1;
      const aWaiting = a.status === "queued" && (a.dependsOnKinds ?? []).some((kind) => !completedKinds.has(kind));
      const bWaiting = b.status === "queued" && (b.dependsOnKinds ?? []).some((kind) => !completedKinds.has(kind));
      if (aWaiting !== bWaiting) return aWaiting ? 1 : -1;
      const aLocked = a.status === "queued" && input.subscriptionTier !== undefined && !canTierRunWorkKind(input.subscriptionTier, a.kind);
      const bLocked = b.status === "queued" && input.subscriptionTier !== undefined && !canTierRunWorkKind(input.subscriptionTier, b.kind);
      if (aLocked !== bLocked) return aLocked ? 1 : -1;
      if (a.status === b.status) return a.updatedAt - b.updatedAt;
      return a.status === "running" ? -1 : 1;
    })
    .slice(0, 5)
    .map((item) => {
      const waitingFor = item.status === "queued" ? (item.dependsOnKinds ?? []).filter((kind) => !completedKinds.has(kind)) : [];
      const locked = item.status === "queued" && input.subscriptionTier !== undefined && !canTierRunWorkKind(input.subscriptionTier, item.kind);
      return {
        title: item.title,
        status: locked ? "locked" as const : waitingFor.length ? "waiting" as const : item.status as "running" | "queued",
        requiredTier: item.kind ? minimumTierForWorkKind(item.kind) ?? undefined : undefined,
        ...(waitingFor.length ? { waitingFor } : {}),
      };
    });

  if (currentWork?.status === "waiting" && !next.some((item) => /patent|legal/i.test(item.title))) {
    next.unshift({ title: "Internal Legal review of Patent Readiness", status: "waiting", requiredTier: undefined, waitingFor: ["Internal Legal disposition"] });
  }

  return { completed, discoveries, needsInventor, next, ...(currentWork ? { currentWork } : {}) };
}
