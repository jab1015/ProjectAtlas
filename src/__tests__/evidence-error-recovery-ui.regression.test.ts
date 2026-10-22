import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/app/(app)/invention/[id]/evidence/page.tsx", "utf8");

describe("evidence list failure recovery copy", () => {
  it("offers a safe support path without asking inventors to expose raw console errors", () => {
    expect(source).toContain("contact support");
    expect(source).toContain("mention that your evidence list did not load");
    expect(source).not.toContain("copy the browser console error");
  });
});
