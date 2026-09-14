from pathlib import Path


def replace(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"Patch anchor not found in {path}: {old[:160]!r}")
    p.write_text(text.replace(old, new, 1))

Path("convex/usageSettlementLogic.ts").write_text('''export function conservativeAttemptSettlementCost(input: {\n  usageKnown: boolean;\n  actualCostUnits: number;\n  reservedCostUnits?: number;\n}) {\n  const actual = Math.max(0, input.actualCostUnits);\n  if (input.usageKnown) return actual;\n  return Math.max(actual, Math.max(0, input.reservedCostUnits ?? 0));\n}\n''')

replace(
    "convex/atlasWorkState.ts",
    'import { ensureOrganizationDailyUsage, findOrganizationDailyUsage } from "./organizationDailyUsage";',
    'import { ensureOrganizationDailyUsage, findOrganizationDailyUsage } from "./organizationDailyUsage";\nimport { conservativeAttemptSettlementCost } from "./usageSettlementLogic";',
)
replace(
    "convex/atlasWorkState.ts",
    '''    const willRetry = shouldRetryWork(item.attemptCount, item.maxAttempts ?? 3);
    await settleUsageReservation(ctx, item, item.inventionId, args.actualCostUnits, 0, args.failedAt);''',
    '''    const willRetry = shouldRetryWork(item.attemptCount, item.maxAttempts ?? 3);
    const settledCostUnits = conservativeAttemptSettlementCost({
      usageKnown: args.usageKnown,
      actualCostUnits: args.actualCostUnits,
      reservedCostUnits: item.reservedCostUnits,
    });
    await settleUsageReservation(ctx, item, item.inventionId, settledCostUnits, 0, args.failedAt);''',
)
replace(
    "convex/atlasWorkState.ts",
    '''      costUnits: args.actualCostUnits,
      metadata: { retryScheduled: willRetry, usageKnown: args.usageKnown },''',
    '''      costUnits: args.usageKnown ? args.actualCostUnits : undefined,
      metadata: { retryScheduled: willRetry, usageKnown: args.usageKnown, budgetDebitUnits: settledCostUnits },''',
)
replace(
    "convex/atlasWorkState.ts",
    '''    await settleUsageReservation(ctx, item, item.inventionId, args.actualCostUnits, 0, args.blockedAt);
    await ctx.db.patch(args.workItemId, {''',
    '''    const settledCostUnits = conservativeAttemptSettlementCost({
      usageKnown: args.usageKnown,
      actualCostUnits: args.actualCostUnits,
      reservedCostUnits: item.reservedCostUnits,
    });
    await settleUsageReservation(ctx, item, item.inventionId, settledCostUnits, 0, args.blockedAt);
    await ctx.db.patch(args.workItemId, {''',
)
replace(
    "convex/atlasWorkState.ts",
    '''      costUnits: args.actualCostUnits,
      metadata: { gateType: args.gateType, usageKnown: args.usageKnown },''',
    '''      costUnits: args.usageKnown ? args.actualCostUnits : undefined,
      metadata: { gateType: args.gateType, usageKnown: args.usageKnown, budgetDebitUnits: settledCostUnits },''',
)

replace(
    "convex/nativeCad.ts",
    'import { resolveInventionUsageScope } from "./organizationUsageScope";',
    'import { resolveInventionUsageScope } from "./organizationUsageScope";\nimport { conservativeAttemptSettlementCost } from "./usageSettlementLogic";',
)
replace(
    "convex/nativeCad.ts",
    '''    const willRetry = workItem.attemptCount < (workItem.maxAttempts ?? 3);
    await settleCadUsage(ctx, workItem, args.inventionId, args.actualCostUnits, 0, args.failedAt);''',
    '''    const willRetry = workItem.attemptCount < (workItem.maxAttempts ?? 3);
    const settledCostUnits = conservativeAttemptSettlementCost({
      usageKnown: args.usageKnown,
      actualCostUnits: args.actualCostUnits,
      reservedCostUnits: workItem.reservedCostUnits,
    });
    await settleCadUsage(ctx, workItem, args.inventionId, settledCostUnits, 0, args.failedAt);''',
)
replace(
    "convex/nativeCad.ts",
    'metadata: { error: args.error.slice(0, 1000), willRetry, usageKnown: args.usageKnown }, createdAt: args.failedAt',
    'metadata: { error: args.error.slice(0, 1000), willRetry, usageKnown: args.usageKnown, budgetDebitUnits: settledCostUnits }, createdAt: args.failedAt',
)

Path("src/__tests__/unknown-usage-settlement.regression.test.ts").write_text('''import { describe, expect, it } from "vitest";\nimport { readFileSync } from "node:fs";\nimport { join } from "node:path";\nimport { conservativeAttemptSettlementCost } from "@convex/usageSettlementLogic";\n\ndescribe("unknown provider usage settlement", () => {\n  it("uses measured cost when provider usage is known", () => {\n    expect(conservativeAttemptSettlementCost({ usageKnown: true, actualCostUnits: 7, reservedCostUnits: 18 })).toBe(7);\n  });\n\n  it("conservatively debits the reserved budget when provider usage is unknown", () => {\n    expect(conservativeAttemptSettlementCost({ usageKnown: false, actualCostUnits: 0, reservedCostUnits: 18 })).toBe(18);\n    expect(conservativeAttemptSettlementCost({ usageKnown: false, actualCostUnits: 5, reservedCostUnits: 3 })).toBe(5);\n  });\n\n  it("keeps unknown usage explicit while applying the conservative budget debit in general and CAD failure paths", () => {\n    const general = readFileSync(join(process.cwd(), "convex/atlasWorkState.ts"), "utf8");\n    const cad = readFileSync(join(process.cwd(), "convex/nativeCad.ts"), "utf8");\n    expect(general).toContain("budgetDebitUnits: settledCostUnits");\n    expect(general).toContain("costUnits: args.usageKnown ? args.actualCostUnits : undefined");\n    expect(cad).toContain("budgetDebitUnits: settledCostUnits");\n    expect(cad).toContain("conservativeAttemptSettlementCost");\n  });\n});\n''')
