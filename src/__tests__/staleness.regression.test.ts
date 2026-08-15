import { describe, expect, it } from "vitest";
import { materiallyChanged, shouldRequeueWorkKind, staleReasonForField } from "@convex/stalenessLogic";

describe("downstream staleness", () => {
  it("ignores whitespace-only edits but catches material brief changes", () => {
    expect(materiallyChanged("A safer handle", "  A safer handle  ")).toBe(false);
    expect(materiallyChanged("A safer handle", "A lighter handle")).toBe(true);
  });

  it("preserves idea capture while requeueing generated work", () => {
    expect(shouldRequeueWorkKind("idea_capture")).toBe(false);
    expect(shouldRequeueWorkKind("preliminary_prior_art")).toBe(true);
  });

  it("creates an inventor-readable stale reason", () => {
    expect(staleReasonForField("targetAudience")).toContain("target audience changed");
  });
});
