import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("InventSmith legacy invention workspace guard", () => {
  it("routes Stage 5+ inventions away from the retired four-stage workspace", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/(app)/invention/[id]/layout.tsx"),
      "utf8"
    );

    expect(source).toContain("state.currentStageId >= 5");
    expect(source).toContain('router.replace(`${rootPath}/journey`)');
    expect(source).toContain("Opening the complete InventSmith journey");
  });

  it("preserves the specialized Stage 1–4 intake/validation workspace", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/(app)/invention/[id]/layout.tsx"),
      "utf8"
    );

    expect(source).toContain("pathname === rootPath");
    expect(source).toContain("return children");
  });
});
