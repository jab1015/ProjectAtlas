export const DELIVERABLE_TRUST_LABELS = {
  atlas_draft: "Atlas draft",
  evidence_checked: "Evidence checked",
  inventor_approved: "Inventor approved",
  professional_review_required: "Professional review required",
  professionally_reviewed: "Professionally reviewed",
  ready_for_authorized_use: "Ready for authorized use",
} as const;

export type DeliverableTrustState = keyof typeof DELIVERABLE_TRUST_LABELS;

export function getDeliverableTrustLabel(state: string): string {
  return state in DELIVERABLE_TRUST_LABELS
    ? DELIVERABLE_TRUST_LABELS[state as DeliverableTrustState]
    : "Unknown review state";
}

export function isDeliverableReadyForExternalUse(state: string, staleReason?: string): boolean {
  return state === "ready_for_authorized_use" && !staleReason;
}

export function contentToReadableText(content: unknown): string {
  if (typeof content === "string") return content;
  if (content === null || content === undefined) return "";
  if (Array.isArray(content)) {
    return content.map((item) => `- ${contentToReadableText(item)}`).join("\n");
  }
  if (typeof content === "object") {
    return Object.entries(content as Record<string, unknown>)
      .map(([key, value]) => `## ${key.replace(/([a-z])([A-Z])/g, "$1 $2")}\n\n${contentToReadableText(value)}`)
      .join("\n\n");
  }
  return String(content);
}
