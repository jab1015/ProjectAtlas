export type InventionProductType = "physical" | "software" | "hybrid";
export type InventionSupportClass = "standard" | "regulated_review" | "unsupported";

export interface InventionClassificationInput {
  title?: string;
  problemStatement?: string;
  targetAudience?: string;
  solutionDescription?: string;
}

export interface InventionClassification {
  productType: InventionProductType;
  supportClass: InventionSupportClass;
  categories: string[];
  professionalReviewAreas: string[];
  unsupportedReason?: string;
}

const SOFTWARE_PATTERNS = [
  /\b(app|application|software|saas|platform|website|web app|mobile app|ios|android|api|algorithm|cloud service|digital service|browser extension|desktop software|ai assistant|machine learning)\b/i,
];

const PHYSICAL_PATTERNS = [
  /\b(device|tool|mechanism|hardware|sensor|electronics|circuit|enclosure|assembly|material|manufactur|prototype|mechanical|motor|pump|valve|container|packaging|wearable|fixture|appliance|product)\b/i,
];

const REGULATED_CATEGORIES: Array<{ category: string; review: string; patterns: RegExp[] }> = [
  { category: "medical or diagnostic product", review: "medical/regulatory professional review", patterns: [/\bmedical device\b/i, /\bdiagnos(?:e|is|tic)\b/i, /\bpatient\b/i, /\bimplant(?:able)?\b/i, /\bprosthe(?:tic|sis)\b/i, /\btherapeutic\b/i, /\bsurgical\b/i] },
  { category: "drug, ingestible, food, or regulated formulation", review: "food/drug/regulatory professional review", patterns: [/\bdrug\b/i, /\bmedication\b/i, /\bpharmaceutical\b/i, /\bsupplement\b/i, /\bingest(?:ed|ible|ion)?\b/i, /\bfood product\b/i, /\bbeverage formulation\b/i] },
  { category: "children's safety product", review: "product-safety/compliance professional review", patterns: [/\bchild(?:ren|'s)? safety\b/i, /\binfant safety\b/i, /\bcar seat\b/i, /\bcrib safety\b/i, /\bbaby gate\b/i] },
  { category: "life-safety or protective equipment", review: "qualified safety/engineering professional review", patterns: [/\blife[- ]safety\b/i, /\bfall protection\b/i, /\brespirator\b/i, /\bfire suppression\b/i, /\bemergency breathing\b/i, /\blife support\b/i] },
  { category: "load-bearing or structural safety product", review: "qualified structural/mechanical engineering review", patterns: [/\bload[- ]bearing\b/i, /\bstructural support\b/i, /\bfall arrest\b/i, /\blifting people\b/i, /\bhuman suspension\b/i] },
  { category: "automotive, aerospace, aviation, or transport safety system", review: "qualified engineering/regulatory review", patterns: [/\baircraft\b/i, /\baviation\b/i, /\baerospace\b/i, /\bautomotive safety\b/i, /\bvehicle braking\b/i, /\bsteering system\b/i] },
  { category: "regulated electrical or communications product", review: "electrical/FCC/certification professional review", patterns: [/\bhigh voltage\b/i, /\bmains voltage\b/i, /\bradio transmitter\b/i, /\brf transmitter\b/i, /\bwireless medical\b/i] },
  { category: "regulated financial, health, or privacy-sensitive software", review: "privacy/security/compliance professional review", patterns: [/\bhipaa\b/i, /\bpatient data\b/i, /\bfinancial advice\b/i, /\binvestment advice\b/i, /\bcredit decision\b/i, /\bbiometric identification\b/i] },
];

const UNSUPPORTED_CATEGORIES: Array<{ category: string; reason: string; patterns: RegExp[] }> = [
  { category: "weapon or destructive device", reason: "InventSmith does not develop products whose primary purpose is to injure people or materially improve weapon/destructive capability.", patterns: [/\bfirearm\b/i, /\bammunition\b/i, /\bweapon system\b/i, /\bexplosive device\b/i, /\bdetonator\b/i, /\bbomb\b/i, /\bgrenade\b/i] },
  { category: "malware or unauthorized cyberattack tooling", reason: "InventSmith does not develop malware, credential theft, unauthorized access, destructive cyberattack, or similar abusive software.", patterns: [/\bransomware\b/i, /\bcredential steal/i, /\bpassword steal/i, /\bmalware\b/i, /\bbotnet\b/i, /\bkeylogger\b/i, /\bphishing kit\b/i, /\bunauthorized access\b/i] },
  { category: "covert or unauthorized surveillance", reason: "InventSmith does not develop products primarily intended for covert or unauthorized surveillance, stalking, or interception.", patterns: [/\bspyware\b/i, /\bstalkerware\b/i, /\bsecretly record\b/i, /\bcovert surveillance\b/i, /\bintercept private messages\b/i] },
  { category: "fraud, theft, or deceptive abuse", reason: "InventSmith does not develop products whose intended function materially facilitates fraud, theft, impersonation, or deceptive abuse.", patterns: [/\bsteal credit card\b/i, /\bidentity theft\b/i, /\bcommit fraud\b/i, /\bimpersonate.*financial\b/i, /\bbypass payment\b/i] },
  { category: "dangerous chemical or biological weaponization", reason: "InventSmith does not develop products intended to weaponize toxic, biological, radiological, or similarly dangerous agents.", patterns: [/\bchemical weapon\b/i, /\bbiological weapon\b/i, /\bweaponize.*toxin\b/i, /\bweaponize.*pathogen\b/i, /\bradiological weapon\b/i] },
];

function combinedText(input: InventionClassificationInput) {
  return [input.title, input.problemStatement, input.targetAudience, input.solutionDescription].filter(Boolean).join("\n");
}

export function classifyInvention(input: InventionClassificationInput): InventionClassification {
  const text = combinedText(input);
  const software = SOFTWARE_PATTERNS.some((pattern) => pattern.test(text));
  const physical = PHYSICAL_PATTERNS.some((pattern) => pattern.test(text));
  const productType: InventionProductType = software && physical ? "hybrid" : software ? "software" : "physical";

  const unsupported = UNSUPPORTED_CATEGORIES.filter(({ patterns }) => patterns.some((pattern) => pattern.test(text)));
  if (unsupported.length > 0) {
    return {
      productType,
      supportClass: "unsupported",
      categories: unsupported.map((item) => item.category),
      professionalReviewAreas: [],
      unsupportedReason: unsupported.map((item) => item.reason).join(" "),
    };
  }

  const regulated = REGULATED_CATEGORIES.filter(({ patterns }) => patterns.some((pattern) => pattern.test(text)));
  return {
    productType,
    supportClass: regulated.length > 0 ? "regulated_review" : "standard",
    categories: regulated.map((item) => item.category),
    professionalReviewAreas: [...new Set(regulated.map((item) => item.review))],
  };
}

export function riskClassForClassification(classification: InventionClassification): "standard" | "restricted" | "professional_review_required" {
  if (classification.supportClass === "unsupported") return "restricted";
  if (classification.supportClass === "regulated_review") return "professional_review_required";
  return "standard";
}

export function unsupportedInventionMessage(classification: InventionClassification) {
  return classification.unsupportedReason ?? "This project is outside InventSmith's supported invention-development scope.";
}

const PHYSICAL_ONLY_WORK_KINDS = new Set([
  "materials_manufacturing",
  "preliminary_bom_cost",
  "design_directions",
  "concept_image_generation",
  "engineering_handoff",
  "design_candidate_generation",
  "design_candidate_scoring",
  "product_design_specification",
  "cad_model_specification",
  "exploded_view_specification",
  "manufacturing_drawing_specification",
  "native_cad_generation",
  "product_render_generation",
  "prototype_strategy",
  "prototype_sourcing_plan",
  "prototype_test_plan",
  "prototype_physical_evidence",
  "prototype_evidence_assessment",
  "prototype_design_gap_analysis",
  "prototype_readiness",
  "manufacturing_process_plan",
  "factory_requirements",
  "manufacturer_sourcing",
  "manufacturer_rfq_package",
  "manufacturer_scorecard",
  "manufacturing_unit_economics",
  "manufacturer_quote_evidence",
  "manufacturer_quote_comparison",
  "manufacturing_agreement_checklist",
  "manufacturing_readiness",
]);

export function workKindAppliesToProductType(kind: string, productType: InventionProductType) {
  if (productType === "hybrid") return true;
  if (productType === "software") return !PHYSICAL_ONLY_WORK_KINDS.has(kind);
  return !kind.startsWith("software_");
}

export function stageLabelForProductType(stageId: number, productType: InventionProductType, defaultName: string) {
  if (productType !== "software") return defaultName;
  if (stageId === 5) return "Software Product Design";
  if (stageId === 6) return "Software Prototype & Build";
  if (stageId === 7) return "Software Engineering & Release Readiness";
  return defaultName;
}
