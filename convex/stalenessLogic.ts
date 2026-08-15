export const MATERIAL_INVENTION_FIELDS = [
  "title",
  "problemStatement",
  "targetAudience",
  "solutionDescription",
] as const;

export type MaterialInventionField = typeof MATERIAL_INVENTION_FIELDS[number];

export function materiallyChanged(previous: string | undefined, next: string): boolean {
  return (previous ?? "").trim() !== next.trim();
}

export function staleReasonForField(field: MaterialInventionField): string {
  const label = field.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return `The invention ${label} changed after this work was generated.`;
}

export function shouldRequeueWorkKind(kind: string): boolean {
  return kind !== "idea_capture";
}
