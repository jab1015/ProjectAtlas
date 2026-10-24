import { describe, expect, it } from "vitest";
import { hasAcceptedInternalLegalHandoff } from "@/lib/internalLegalHandoffState";

describe("Internal Legal handoff display state", () => {
  it("does not call a prepared handoff recorded before Legal accepts it", () => {
    expect(hasAcceptedInternalLegalHandoff("handoff-1", [])).toBe(false);
    expect(hasAcceptedInternalLegalHandoff("handoff-1", [
      { deliverableId: "handoff-1", specialty: "patent", status: "pending" },
    ])).toBe(false);
  });

  it("records the handoff only after an accepted patent review for that deliverable", () => {
    expect(hasAcceptedInternalLegalHandoff("handoff-1", [
      { deliverableId: "other", specialty: "patent", status: "accepted" },
      { deliverableId: "handoff-1", specialty: "engineering", status: "accepted" },
    ])).toBe(false);
    expect(hasAcceptedInternalLegalHandoff("handoff-1", [
      { deliverableId: "handoff-1", specialty: "patent", status: "accepted" },
    ])).toBe(true);
  });
});
