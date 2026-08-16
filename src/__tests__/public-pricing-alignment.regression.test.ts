import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("InventSmith public pricing alignment", () => {
  const publicPricing = read("src/app/(public)/pricing/page.tsx");
  const account = read("src/app/(app)/account/page.tsx");
  const usage = read("convex/usagePolicyLogic.ts");
  const entitlement = read("convex/entitlementPolicyLogic.ts");
  const landing = read("src/app/page.tsx");

  it("keeps the public route present for the landing-page pricing link", () => {
    expect(landing).toContain('href="/pricing"');
    expect(publicPricing).toContain("Choose how much of the Workshop you need.");
  });

  it("matches the authenticated plan prices and active-invention capacities", () => {
    for (const value of [
      'name: "Explorer"', 'price: "Free"', 'activeInventions: 1',
      'name: "Inventor"', 'price: "$39/month"', 'activeInventions: 3',
      'name: "Pro"', 'price: "$79/month"', 'activeInventions: 10',
      'name: "Enterprise"', 'price: "$149/month"', 'activeInventions: 25',
    ]) {
      expect(account).toContain(value);
    }
    for (const value of ["Explorer", "Free", "1 active invention", "Inventor", "$39/month", "3 active inventions", "Pro", "$79/month", "10 active inventions", "Enterprise", "$149/month", "25 active inventions"]) {
      expect(publicPricing).toContain(value);
    }
  });

  it("matches enforced daily usage allowances and does not overstate lower-tier entitlement", () => {
    expect(usage).toContain("free: { autonomousCostUnits: 25, chatQuestions: 30 }");
    expect(usage).toContain("inventor: { autonomousCostUnits: 125, chatQuestions: 100 }");
    expect(usage).toContain("pro: { autonomousCostUnits: 350, chatQuestions: 200 }");
    expect(usage).toContain("enterprise: { autonomousCostUnits: 600, chatQuestions: 300 }");
    for (const value of [
      "25 autonomous work units/day", "30 Ask InventSmith questions/day",
      "125 autonomous work units/day", "100 Ask InventSmith questions/day",
      "350 autonomous work units/day", "200 Ask InventSmith questions/day",
      "600 autonomous work units/day", "300 Ask InventSmith questions/day",
    ]) expect(publicPricing).toContain(value);

    expect(entitlement).toContain('if (normalized === "enterprise" || normalized === "pro") return PRO_WORK.has(kind)');
    expect(publicPricing).toContain("Unlock the complete InventSmith idea-to-market work system");
    expect(publicPricing).not.toContain("Inventor unlocks the complete");
  });
});
