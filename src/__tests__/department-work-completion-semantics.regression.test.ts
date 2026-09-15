import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  join(process.cwd(), "src", "app", "(app)", "invention", "[id]", "department", "[stageId]", "page.tsx"),
  "utf8",
);

describe("department work completion semantics", () => {
  it("labels completed department items as work completion rather than external execution", () => {
    expect(source).toContain('completed: "Work complete"');
    expect(source).not.toContain('completed: "Complete"');
    expect(source).toContain(
      "InventSmith performs eligible work autonomously and stops only at genuine inventor, professional, physical, payment, or external-action gates.",
    );
  });
});
