import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  join(process.cwd(), "src", "components", "atlas", "status-briefing.tsx"),
  "utf8",
);

describe("status briefing completion semantics", () => {
  it("scopes completion to InventSmith work rather than an external real-world action", () => {
    expect(source).toContain("Recently completed work");
    expect(source).not.toContain('>Recently completed</h3>');
    expect(source).toContain("Completed work will appear here as InventSmith begins.");
  });
});
