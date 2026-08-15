import { describe, expect, it } from "vitest";
import {
  contentToReadableText,
  getDeliverableTrustLabel,
  isDeliverableReadyForExternalUse,
} from "@convex/deliverableLogic";

describe("deliverable trust states", () => {
  it("does not treat reviewed work as externally authorized", () => {
    expect(isDeliverableReadyForExternalUse("professionally_reviewed")).toBe(false);
    expect(isDeliverableReadyForExternalUse("ready_for_authorized_use")).toBe(true);
    expect(isDeliverableReadyForExternalUse("ready_for_authorized_use", "Inputs changed")).toBe(false);
  });

  it("provides a safe fallback for an unknown state", () => {
    expect(getDeliverableTrustLabel("future_state")).toBe("Unknown review state");
  });
});

describe("deliverable content rendering", () => {
  it("turns structured content into readable text", () => {
    expect(contentToReadableText({ summary: "Strong demand", risks: ["Cost", "Testing"] }))
      .toContain("## summary");
    expect(contentToReadableText({ risks: ["Cost", "Testing"] })).toContain("- Cost");
  });

  it("does not invent content for an empty deliverable", () => {
    expect(contentToReadableText(undefined)).toBe("");
  });
});
