export interface EvidenceImpactWorkItemLike {
  kind: string;
  dependsOnKinds?: string[];
}

const EVIDENCE_IMPACT_SEEDS: Record<string, readonly string[]> = {
  prototype_test: ["prototype_physical_evidence"],
  manufacturer_quote: ["manufacturer_quote_evidence", "manufacturing_unit_economics"],
  sales_evidence: ["launch_actual_evidence"],
};

export function evidenceGateRootKind(evidenceKind: string | undefined): string | undefined {
  if (evidenceKind === "prototype_test") return "prototype_physical_evidence";
  if (evidenceKind === "manufacturer_quote") return "manufacturer_quote_evidence";
  if (evidenceKind === "sales_evidence") return "launch_actual_evidence";
  return undefined;
}

/**
 * Returns the work kinds that must be refreshed for a known, narrowly scoped
 * real-world evidence class. Unknown/general evidence returns null so callers
 * retain the conservative broad-invalidation behavior.
 *
 * Manufacturer quotes additionally seed production unit economics because real
 * quote changes must refresh cost assumptions even though the preliminary cost
 * model is intentionally allowed to exist before a quote arrives.
 */
export function impactedWorkKindsForEvidence(
  items: readonly EvidenceImpactWorkItemLike[],
  evidenceKind: string | undefined
): Set<string> | null {
  if (!evidenceKind) return null;
  const seeds = EVIDENCE_IMPACT_SEEDS[evidenceKind];
  if (!seeds) return null;

  const impacted = new Set(seeds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of items) {
      if (impacted.has(item.kind)) continue;
      if ((item.dependsOnKinds ?? []).some((dependency) => impacted.has(dependency))) {
        impacted.add(item.kind);
        changed = true;
      }
    }
  }
  return impacted;
}
