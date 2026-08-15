export interface InventionRiskInput {
  title?: string;
  problemStatement?: string;
  targetAudience?: string;
  solutionDescription?: string;
}

export interface InventionRiskTriage {
  restricted: boolean;
  categories: string[];
}

const CATEGORY_PATTERNS: Array<{ category: string; patterns: RegExp[] }> = [
  {
    category: "medical or diagnostic product",
    patterns: [
      /\bmedical device\b/i,
      /\bdiagnos(?:e|is|tic)\b/i,
      /\bpatient\b/i,
      /\bimplant(?:able)?\b/i,
      /\bprosthe(?:tic|sis)\b/i,
      /\btherapeutic\b/i,
      /\bsurgical\b/i,
    ],
  },
  {
    category: "drug, ingestible, or regulated formulation",
    patterns: [
      /\bdrug\b/i,
      /\bmedication\b/i,
      /\bpharmaceutical\b/i,
      /\bsupplement\b/i,
      /\bingest(?:ed|ible|ion)?\b/i,
      /\bfood product\b/i,
      /\bbeverage formulation\b/i,
    ],
  },
  {
    category: "weapon or explosive",
    patterns: [
      /\bfirearm\b/i,
      /\bammunition\b/i,
      /\bweapon\b/i,
      /\bexplosive\b/i,
      /\bdetonator\b/i,
      /\bgun\b/i,
    ],
  },
  {
    category: "children's safety product",
    patterns: [
      /\bchild(?:ren|'s)? safety\b/i,
      /\binfant safety\b/i,
      /\bcar seat\b/i,
      /\bcrib safety\b/i,
      /\bbaby gate\b/i,
    ],
  },
  {
    category: "life-safety or protective equipment",
    patterns: [
      /\blife[- ]safety\b/i,
      /\bfall protection\b/i,
      /\brespirator\b/i,
      /\bfire suppression\b/i,
      /\bemergency breathing\b/i,
      /\blife support\b/i,
    ],
  },
  {
    category: "load-bearing or structural safety product",
    patterns: [
      /\bload[- ]bearing\b/i,
      /\bstructural support\b/i,
      /\bfall arrest\b/i,
      /\blifting people\b/i,
      /\bhuman suspension\b/i,
    ],
  },
  {
    category: "hazardous material or high-risk chemical product",
    patterns: [
      /\bhazardous material\b/i,
      /\bhazmat\b/i,
      /\btoxic chemical\b/i,
      /\bcorrosive chemical\b/i,
      /\bflammable chemical\b/i,
      /\bpesticide\b/i,
    ],
  },
];

export function triageInventionRisk(input: InventionRiskInput): InventionRiskTriage {
  const text = [input.title, input.problemStatement, input.targetAudience, input.solutionDescription]
    .filter(Boolean)
    .join("\n");
  const categories = CATEGORY_PATTERNS
    .filter(({ patterns }) => patterns.some((pattern) => pattern.test(text)))
    .map(({ category }) => category);
  return { restricted: categories.length > 0, categories };
}

export function restrictedPilotReason(categories: string[]) {
  const scope = categories.length > 0 ? categories.join(", ") : "a potentially safety-critical category";
  return `This invention appears to involve ${scope}. The controlled Atlas pilot does not autonomously advance safety-critical or highly regulated product categories. A qualified professional must review the product category and define a safe development scope before Atlas continues.`;
}
