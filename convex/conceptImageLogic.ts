export const CONCEPT_IMAGE_COST_UNITS = 20;

export function buildConceptImagePrompt(rawPrompt: string): string {
  const direction = rawPrompt.trim().slice(0, 6000);
  if (!direction) throw new Error("Concept visualization prompt was empty");
  return [
    "Create a professional concept visualization board for invention-development review.",
    "Show exploratory industrial-design directions only.",
    "Do not imply production CAD, validated dimensions or tolerances, engineering approval, regulatory approval, certification, or patent status.",
    direction,
  ].join(" ");
}
