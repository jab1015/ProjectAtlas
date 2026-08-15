export const CONCEPT_IMAGE_COST_UNITS = 20;
export const PRODUCT_RENDER_COST_UNITS = 24;

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

export function buildProductRenderPrompt(rawPrompt: string): string {
  const direction = rawPrompt.trim().slice(0, 7000);
  if (!direction) throw new Error("Product render prompt was empty");
  return [
    "Create a polished industrial-design rendering board of the SELECTED invention design for inventor, manufacturer, and investor communication.",
    "Keep the product architecture, visible mechanisms, material intent, interfaces, proportions, differentiation constraints, and part relationships consistent with the supplied selected-design/CAD description.",
    "Include a clean hero three-quarter product render plus complementary views or detail callouts when the requested board supports them.",
    "Use professional neutral presentation lighting and a clean background. Do not add invented logos, certifications, patent claims, dimensions, tolerances, features, controls, fasteners, or mechanisms that are not in the supplied design.",
    "This is a presentation rendering of preliminary design state, not evidence of engineering approval, manufacturability, regulatory approval, or production release.",
    direction,
  ].join(" ");
}
