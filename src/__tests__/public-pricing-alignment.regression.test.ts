import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("InventSmith public pricing alignment", () => {
  const publicPricing = read("src/app/(public)/pricing/page.tsx");
  const policy = read("convex/organizationPolicyLogic.ts");
  const entitlement = read("convex/entitlementPolicyLogic.ts");
  const landing = read("src/app/page.tsx");

  it("keeps the public route present for the landing-page pricing link", () => {
    expect(landing).toContain('href="/pricing"');
    expect(publicPricing).toContain("A plan for one invention—or an entire invention practice.");
  });

  it("matches the approved organization prices, active-invention capacities, and included seats", () => {
    for (const value of [
      'displayName: "Explorer"', "monthlyPriceUsd: 0", "activeInventionLimit: 1", "includedSeatLimit: 1",
      'displayName: "Inventor"', "monthlyPriceUsd: 39",
      'displayName: "Pro"', "monthlyPriceUsd: 99",
      'displayName: "Enterprise"', "monthlyPriceUsd: 199", "activeInventionLimit: 2", "includedSeatLimit: 3",
      'displayName: "Studio 3"', "monthlyPriceUsd: 299", "activeInventionLimit: 3", "includedSeatLimit: 5",
      'displayName: "Studio 6"', "monthlyPriceUsd: 399", "activeInventionLimit: 6", "includedSeatLimit: 8",
    ]) expect(policy).toContain(value);

    for (const value of [
      "Explorer", "Free", "1 active invention · 1 user",
      "Inventor", "$39/month",
      "Pro", "$99/month",
      "Enterprise", "$199/month", "2 active inventions · 3 users",
      "Studio 3", "$299/month", "3 active inventions · 5 users",
      "Studio 6", "$399/month", "6 active inventions · 8 users",
    ]) expect(publicPricing).toContain(value);
  });

  it("does not sell raw model units as the primary public value proposition", () => {
    expect(publicPricing).not.toContain("autonomous work units/day");
    expect(publicPricing).not.toContain("Ask InventSmith questions/day");
    expect(publicPricing).toContain("Bounded AI, research, CAD, render, and document usage");
    expect(publicPricing).toContain("Pro");
    expect(publicPricing).toContain("complete idea-to-market");
    expect(entitlement).toContain('if (normalized === "enterprise" || normalized === "pro") return PRO_WORK.has(kind)');
  });
});
