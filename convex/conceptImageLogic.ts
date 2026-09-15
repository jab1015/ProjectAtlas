export const CONCEPT_IMAGE_COST_UNITS = 20;
export const PRODUCT_RENDER_COST_UNITS = 24;
export const BRAND_IDENTITY_COST_UNITS = 20;

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
    "Create a polished MULTI-VIEW industrial-design presentation board of the SELECTED invention design for inventor, manufacturer, and investor communication.",
    "Keep the product architecture, visible mechanisms, material intent, interfaces, proportions, differentiation constraints, and part relationships consistent across every view and with the supplied selected-design/CAD description.",
    "The board should include: (1) a primary hero three-quarter render, (2) front view, (3) side view, (4) top view, and (5) one useful mechanism/detail close-up when the supplied design supports it.",
    "Use the same product revision in every panel. Do not silently change geometry, component count, actuation method, seams, lid/base relationships, or interface locations between views.",
    "Use professional neutral presentation lighting and a clean background. Do not add invented logos, certifications, patent claims, dimensions, tolerances, features, controls, fasteners, or mechanisms that are not in the supplied design.",
    "Do not fabricate an exploded view from appearance alone; InventSmith's deterministic CAD exploded-view artifact is the authoritative assembly-separation view.",
    "This is a presentation rendering of preliminary design state, not evidence of engineering approval, manufacturability, regulatory approval, or production release.",
    direction,
  ].join(" ");
}

export function buildBrandIdentityPrompt(rawPrompt: string): string {
  const direction = rawPrompt.trim().slice(0, 7000);
  if (!direction) throw new Error("Brand identity visualization prompt was empty");
  return [
    "Create a professional PRODUCT BRAND CONCEPT BOARD for an inventor evaluating a proposed commercial identity.",
    "Use only the supplied brand positioning, recommended naming direction, customer evidence, product character, messaging, and visual-direction brief.",
    "Show a coherent visual system rather than random logo variations: primary wordmark/logo concept, simplified mark/icon direction, restrained color palette, typography direction, packaging/product-label application, and one web/retail presentation example where appropriate.",
    "Keep the proposed name spelled consistently across the board. Do not introduce a different product name, company name, slogan, certification, award, patent claim, regulatory claim, performance claim, or invented factual proof point.",
    "This is an exploratory brand-design concept, not trademark clearance, legal approval, final production artwork, or proof that the name/mark is registrable or available.",
    "Favor clear, commercially usable design over decorative mockup clutter. Accessibility and legibility should be considered in the visual direction.",
    direction,
  ].join(" ");
}
