import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("InventSmith public product copy", () => {
  const faq = read("src/app/(public)/faq/page.tsx");
  const pricing = read("src/app/(public)/pricing/page.tsx");
  const landing = read("src/app/page.tsx");

  it("does not describe implemented full-product stages as later roadmap capabilities", () => {
    expect(faq).not.toContain("remain later roadmap capabilities");
    expect(faq).not.toContain("as those capabilities are released");
    expect(faq).not.toContain("pricing hypothesis");
    expect(faq).toContain("Pro unlocks the complete InventSmith work system");
    expect(faq).toContain("Patent Readiness feeds");
    expect(faq).toContain("Product Design + CAD");
  });

  it("keeps public plan copy consistent on the primary pricing and FAQ surfaces", () => {
    for (const value of ["$39/month", "$79/month", "$149/month", "25 autonomous work units per day", "350 autonomous work units per day", "600 autonomous work units per day"]) {
      expect(faq).toContain(value);
    }
    for (const value of ["$39/month", "$79/month", "$149/month", "25 autonomous work units/day", "350 autonomous work units/day", "600 autonomous work units/day"]) {
      expect(pricing).toContain(value);
    }
  });

  it("does not expose the retired Atlas support address on primary public surfaces", () => {
    for (const source of [landing, faq]) {
      expect(source).not.toContain("team@atlas.madethis.app");
      expect(source).toContain("support@madethis.com");
    }
  });
});
