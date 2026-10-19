export type ValidationRecoveryState =
  | "waiting"
  | "running"
  | "partial"
  | "failed"
  | "complete";

export interface ValidationRecoverySummary {
  state: ValidationRecoveryState;
  successfulSectionCount: number;
  failedSectionCount: number;
  pendingSectionCount: number;
  canRetryFailed: boolean;
}

function sectionOutcome(value: unknown): "success" | "failed" | "pending" {
  if (!value || typeof value !== "object") return "pending";
  const record = value as Record<string, unknown>;
  const raw = String(record.sectionStatus ?? record.status ?? "").toLowerCase();
  if (["completed", "complete", "generated", "approved", "edited"].includes(raw)) {
    return "success";
  }
  if (raw === "failed") return "failed";
  return "pending";
}

function sectionEntries(sections: unknown, sectionsJson?: string): unknown[] {
  if (Array.isArray(sections)) return sections;
  if (sections && typeof sections === "object") {
    return Object.values(sections as Record<string, unknown>);
  }
  if (!sectionsJson) return [];
  try {
    const parsed = JSON.parse(sectionsJson) as unknown;
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") {
      return Object.values(parsed as Record<string, unknown>);
    }
  } catch {
    return [];
  }
  return [];
}

export function summarizeValidationRecovery(input: {
  researchStatus?: string;
  status?: string;
  sections?: unknown;
  sectionsJson?: string;
}): ValidationRecoverySummary {
  const outcomes = sectionEntries(input.sections, input.sectionsJson).map(sectionOutcome);
  const successfulSectionCount = outcomes.filter((outcome) => outcome === "success").length;
  const failedSectionCount = outcomes.filter((outcome) => outcome === "failed").length;
  const pendingSectionCount = outcomes.filter((outcome) => outcome === "pending").length;

  const researchStatus = input.researchStatus?.toLowerCase();
  const legacyStatus = input.status?.toLowerCase();
  const running =
    researchStatus === "running" ||
    researchStatus === "pending" ||
    legacyStatus === "running";

  let state: ValidationRecoveryState = "waiting";
  if (running) {
    state = "running";
  } else if (
    researchStatus === "partial" ||
    legacyStatus === "partial" ||
    (failedSectionCount > 0 && successfulSectionCount > 0)
  ) {
    state = "partial";
  } else if (
    researchStatus === "failed" ||
    legacyStatus === "failed" ||
    failedSectionCount > 0
  ) {
    state = "failed";
  } else if (
    researchStatus === "completed" ||
    legacyStatus === "complete" ||
    successfulSectionCount > 0
  ) {
    state = "complete";
  }

  return {
    state,
    successfulSectionCount,
    failedSectionCount,
    pendingSectionCount,
    canRetryFailed: failedSectionCount > 0 && state !== "running",
  };
}
