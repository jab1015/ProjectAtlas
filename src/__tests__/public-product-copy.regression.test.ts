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
  const footer = read("src/components/store-footer.tsx");

  it("does not describe implemented full-product stages as later roadmap capabilities", () => {
    expect(faq).not.toContain("remain later roadmap capabilities");
    expect(faq).not.toContain("as those capabilities are released");
    expect(faq).not.toContain("pricing hypothesis");
    expect(faq).toContain("Pro unlocks the complete InventSmith work system");
    expect(faq).toContain("Patent Readiness feeds");
    expect(faq).toContain("Product Design + CAD");
  });

  it("keeps organization-native plan copy consistent on pricing and FAQ surfaces", () => {
    for (const value of ["$39/month", "$99/month", "$199/month", "$299/month", "$399/month"]) {
      expect(faq).toContain(value);
      expect(pricing).toContain(value);
    }
    for (const value of ["1 active invention", "2 active inventions", "3 active inventions", "6 active inventions"]) {
      expect(faq).toContain(value);
      expect(pricing).toContain(value);
    }
    expect(faq).toContain("Team members share the organization’s subscription and resource allowance");
    expect(pricing).toContain("shared organization usage governance");
    expect(faq).not.toContain("$79/month");
    expect(faq).not.toContain("$149/month");
    expect(pricing).not.toContain("autonomous work units/day");
  });

  it("does not expose the retired Atlas support address on primary public surfaces", () => {
    for (const source of [landing, faq, footer]) {
      expect(source).not.toContain("team@atlas.madethis.app");
      expect(source).toContain("support@madethis.com");
    }
  });
});
