import { canTierRunWorkKind, minimumTierForWorkKind } from "./entitlementPolicyLogic";

export interface BriefingWorkItem {
  kind?: string;
  title: string;
  status: string;
  updatedAt: number;
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
  next: Array<{ title: string; status: "running" | "queued" | "locked"; requiredTier?: string }>;
}

// These are research assignments InventSmith is expected to perform before
// requesting professional review or physical evidence. A stale blocked record
// must not be shown to the inventor as an action they need to complete.
export const AUTONOMOUS_RESEARCH_KINDS = new Set([
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
  // The preliminary patent-to-design handoff is autonomous research. The
  // professional review belongs to the later counsel/clearance package.
  "patent_design_handoff",
  "market_feasibility",
  "regulatory_screening",
  "design_candidate_generation",
]);

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
    .filter((decision) => decision.status === "open")
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
    .filter((item) => item.status === "blocked" && item.blockedReason && !AUTONOMOUS_RESEARCH_KINDS.has(item.kind ?? ""))
    .map((item) => ({
      type: "blocked_work" as const,
      title: item.title,
      detail: item.blockedReason!,
      requestedAt: item.updatedAt,
    }));

  const needsInventor = [...pendingDecisions, ...pendingApprovals, ...blockedWork]
    .sort((a, b) => a.requestedAt - b.requestedAt)
    .slice(0, 10);

  const next = [...input.workItems]
    .filter((item) => item.status === "running" || item.status === "queued")
    .sort((a, b) => {
      const aLocked = a.status === "queued" && input.subscriptionTier !== undefined && !canTierRunWorkKind(input.subscriptionTier, a.kind);
      const bLocked = b.status === "queued" && input.subscriptionTier !== undefined && !canTierRunWorkKind(input.subscriptionTier, b.kind);
      if (aLocked !== bLocked) return aLocked ? 1 : -1;
      if (a.status === b.status) return a.updatedAt - b.updatedAt;
      return a.status === "running" ? -1 : 1;
    })
    .slice(0, 5)
    .map((item) => ({
      title: item.title,
      status: item.status === "queued" && input.subscriptionTier !== undefined && !canTierRunWorkKind(input.subscriptionTier, item.kind) ? "locked" as const : item.status as "running" | "queued",
      requiredTier: item.kind ? minimumTierForWorkKind(item.kind) ?? undefined : undefined,
    }));

  return { completed, discoveries, needsInventor, next };
}
