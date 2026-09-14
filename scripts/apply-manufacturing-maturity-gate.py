from pathlib import Path

# 1) Wire reviewed/stale deliverable maturity into the runtime scheduler.
path = Path('convex/atlasWorkState.ts')
text = path.read_text(encoding='utf-8')
old_import = 'import { conservativeAttemptSettlementCost } from "./usageSettlementLogic";\n'
new_import = old_import + 'import { isManufacturingMaturityEligible } from "./manufacturingMaturityLogic";\n'
if new_import not in text:
    if old_import not in text:
        raise SystemExit('atlasWorkState import anchor not found')
    text = text.replace(old_import, new_import, 1)

old_items = '    const items = await ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect();\n    const usageScope = await resolveInventionUsageScope(ctx, args.inventionId);'
new_items = '    const items = await ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect();\n    const deliverables = await ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect();\n    const usageScope = await resolveInventionUsageScope(ctx, args.inventionId);'
if new_items not in text:
    if old_items not in text:
        raise SystemExit('atlasWorkState items anchor not found')
    text = text.replace(old_items, new_items, 1)

old_select = '''      args.now,\n      (kind) => canTierRunWorkKind(usageScope.plan, kind)\n    );'''
new_select = '''      args.now,\n      (kind) => canTierRunWorkKind(usageScope.plan, kind),\n      (kind) => isManufacturingMaturityEligible(kind, deliverables)\n    );'''
if new_select not in text:
    if old_select not in text:
        raise SystemExit('atlasWorkState selection anchor not found')
    text = text.replace(old_select, new_select, 1)
path.write_text(text, encoding='utf-8')

# 2) Make prototype readiness an explicit work-graph prerequisite for final manufacturing readiness.
path = Path('convex/fullProductWorkPlan.ts')
text = path.read_text(encoding='utf-8')
old = '''      : item.kind === "manufacturer_quote_comparison"\n        ? [...item.dependsOnKinds, "manufacturer_quote_evidence"]\n        : item.kind === "launch_performance"\n          ? [...item.dependsOnKinds, "launch_actual_evidence"]\n          : [...item.dependsOnKinds],'''
new = '''      : item.kind === "manufacturer_quote_comparison"\n        ? [...item.dependsOnKinds, "manufacturer_quote_evidence"]\n        : item.kind === "manufacturing_readiness"\n          ? [...item.dependsOnKinds, "prototype_readiness"]\n          : item.kind === "launch_performance"\n            ? [...item.dependsOnKinds, "launch_actual_evidence"]\n            : [...item.dependsOnKinds],'''
if new not in text:
    if old not in text:
        raise SystemExit('fullProductWorkPlan dependency anchor not found')
    text = text.replace(old, new, 1)
path.write_text(text, encoding='utf-8')

# 3) Add regression coverage for graph + professional/stale maturity + scheduler enforcement.
test = Path('src/__tests__/manufacturing-maturity-gates.regression.test.ts')
test.write_text('''import { describe, expect, it } from "vitest";\nimport { POST_CANONICAL_WORK_PLAN } from "@convex/fullProductWorkPlan";\nimport { isManufacturingMaturityEligible } from "@convex/manufacturingMaturityLogic";\nimport { selectNextWorkItem } from "@convex/workOrchestratorLogic";\n\nconst workByKind = new Map(POST_CANONICAL_WORK_PLAN.map((item) => [item.kind, item]));\n\nconst reviewed = (kind: string, version = 1) => ({\n  kind,\n  version,\n  trustState: "professionally_reviewed",\n});\n\ndescribe("InventSmith manufacturing maturity enforcement", () => {\n  it("requires prototype readiness in the final manufacturing-readiness dependency graph", () => {\n    const readiness = workByKind.get("manufacturing_readiness");\n    expect(readiness?.dependsOnKinds).toEqual(expect.arrayContaining([\n      "manufacturer_quote_comparison",\n      "manufacturing_agreement_checklist",\n      "prototype_readiness",\n    ]));\n  });\n\n  it("fails closed until the latest prototype readiness and RFQ package are fresh and professionally reviewed", () => {\n    expect(isManufacturingMaturityEligible("manufacturing_readiness", [])).toBe(false);\n\n    expect(isManufacturingMaturityEligible("manufacturing_readiness", [\n      reviewed("prototype_readiness_assessment"),\n      { kind: "manufacturer_rfq_package", version: 1, trustState: "professional_review_required" },\n    ])).toBe(false);\n\n    expect(isManufacturingMaturityEligible("manufacturing_readiness", [\n      reviewed("prototype_readiness_assessment"),\n      reviewed("manufacturer_rfq_package", 1),\n      { kind: "manufacturer_rfq_package", version: 2, trustState: "professionally_reviewed", staleReason: "Design evidence changed" },\n    ])).toBe(false);\n\n    expect(isManufacturingMaturityEligible("manufacturing_readiness", [\n      reviewed("prototype_readiness_assessment"),\n      reviewed("manufacturer_rfq_package"),\n    ])).toBe(true);\n  });\n\n  it("does not over-block early manufacturing preparation", () => {\n    expect(isManufacturingMaturityEligible("manufacturer_sourcing", [])).toBe(true);\n    expect(isManufacturingMaturityEligible("manufacturer_rfq_package", [])).toBe(true);\n    expect(isManufacturingMaturityEligible("manufacturer_quote_evidence", [])).toBe(true);\n  });\n\n  it("keeps a dependency-complete manufacturing-readiness item unschedulable until maturity is satisfied", () => {\n    const base = [\n      { _id: "quote", kind: "manufacturer_quote_comparison", status: "completed", priority: 50, createdAt: 1, attemptCount: 1 },\n      { _id: "agreement", kind: "manufacturing_agreement_checklist", status: "completed", priority: 49, createdAt: 2, attemptCount: 1 },\n      { _id: "prototype", kind: "prototype_readiness", status: "completed", priority: 57, createdAt: 3, attemptCount: 1 },\n      {\n        _id: "readiness",\n        kind: "manufacturing_readiness",\n        status: "queued",\n        priority: 48,\n        createdAt: 4,\n        attemptCount: 0,\n        estimatedCostUnits: 1,\n        dependsOnKinds: ["manufacturer_quote_comparison", "manufacturing_agreement_checklist", "prototype_readiness"],\n      },\n    ];\n\n    const blocked = selectNextWorkItem(base, 10, 100, () => true, (kind) => kind !== "manufacturing_readiness");\n    expect(blocked.selected).toBeNull();\n    expect(blocked.reason).toBe("no_eligible_work");\n\n    const allowed = selectNextWorkItem(base, 10, 100, () => true, () => true);\n    expect(allowed.selected?._id).toBe("readiness");\n  });\n});\n''', encoding='utf-8')

print('Applied manufacturing maturity enforcement and regression coverage')
