import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { conservativeAttemptSettlementCost } from "@convex/usageSettlementLogic";

describe("unknown provider usage settlement", () => {
  it("uses measured cost when provider usage is known", () => {
    expect(conservativeAttemptSettlementCost({ usageKnown: true, actualCostUnits: 7, reservedCostUnits: 18 })).toBe(7);
  });

  it("conservatively debits the reserved budget when provider usage is unknown", () => {
    expect(conservativeAttemptSettlementCost({ usageKnown: false, actualCostUnits: 0, reservedCostUnits: 18 })).toBe(18);
    expect(conservativeAttemptSettlementCost({ usageKnown: false, actualCostUnits: 5, reservedCostUnits: 3 })).toBe(5);
  });

  it("keeps unknown usage explicit while applying the conservative budget debit in general and CAD failure paths", () => {
    const general = readFileSync(join(process.cwd(), "convex/atlasWorkState.ts"), "utf8");
    const cad = readFileSync(join(process.cwd(), "convex/nativeCad.ts"), "utf8");
    expect(general).toContain("budgetDebitUnits: settledCostUnits");
    expect(general).toContain("costUnits: args.usageKnown ? args.actualCostUnits : undefined");
    expect(cad).toContain("budgetDebitUnits: settledCostUnits");
    expect(cad).toContain("conservativeAttemptSettlementCost");
  });
});
