import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const journeyPage = readFileSync(
  join(process.cwd(), "src", "app", "(app)", "invention", "[id]", "journey", "page.tsx"),
  "utf8",
);

const journeyCenter = readFileSync(
  join(process.cwd(), "convex", "journeyCenter.ts"),
  "utf8",
);

describe("journey completion semantics", () => {
  it("presents completed stages as completed InventSmith work rather than completed external action", () => {
    expect(journeyPage).toContain('complete: { label: "Stage work complete"');
    expect(journeyPage).toContain("InventSmith’s required work for that stage is complete");
    expect(journeyPage).toContain("It does not mean InventSmith contacted a supplier or professional");
    expect(journeyPage).toContain("placed an order or payment");
    expect(journeyPage).toContain("submitted a filing");
    expect(journeyPage).toContain("published anything");
    expect(journeyPage).toContain("launched a product");
    expect(journeyPage).toContain("Stage-work completion does not by itself represent an external real-world action");
  });

  it("keeps professional-review completion language scoped to required stage work", () => {
    expect(journeyCenter).toContain(
      "Professional review is required before required stage work for ${firstIncomplete.name} can be treated as complete.",
    );
    expect(journeyCenter).not.toContain(
      "Professional review is required before ${firstIncomplete.name} can be treated as complete.",
    );
  });
});
