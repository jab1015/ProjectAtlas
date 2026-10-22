import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/app/(app)/invention/[id]/chat/page.tsx", "utf8");

describe("Ask InventSmith history and send errors", () => {
  it("marks saved replies as snapshots when project status may have changed", () => {
    expect(page).toContain("Treat earlier replies as snapshots");
    expect(page).toContain("ask again when you need the current work ledger");
  });

  it("does not expose raw backend errors or request identifiers in the chat UI", () => {
    expect(page).toContain("We couldn’t send that message. Please retry");
    expect(page).not.toContain("reason.message");
  });
});
