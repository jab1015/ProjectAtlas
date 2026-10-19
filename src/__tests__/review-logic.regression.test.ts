import { describe, expect, it } from "vitest";
import { canResolveApproval, canResolveDecision, canRespondToBlockedWork, readDecisionOptionKeys, validateBlockedWorkResponse } from "@convex/reviewLogic";

describe("inventor decision safety", () => {
  const options = [{ key: "low_cost", label: "Lower cost" }, { key: "premium", label: "Premium" }];
  it("accepts only a listed option on an open decision", () => {
    expect(canResolveDecision("open", "low_cost", options)).toBe(true);
    expect(canResolveDecision("open", "invented_option", options)).toBe(false);
  });
  it("prevents a resolved decision from being resolved again", () => {
    expect(canResolveDecision("approved", "low_cost", options)).toBe(false);
    expect(canResolveDecision("superseded", "low_cost", options)).toBe(false);
  });
  it("ignores malformed option data", () => expect(readDecisionOptionKeys([null, {}, { key: 12 }, { key: "valid" }])).toEqual(["valid"]));
});

describe("inventor approval safety", () => {
  it("allows only pending approvals to be resolved", () => {
    expect(canResolveApproval("pending")).toBe(true);
    expect(canResolveApproval("approved")).toBe(false);
    expect(canResolveApproval("denied")).toBe(false);
    expect(canResolveApproval("expired")).toBe(false);
  });
});

describe("blocked autonomous work", () => {
  it("accepts and trims bounded free-form input only for explicit private information", () => {
    expect(validateBlockedWorkResponse("blocked", "  Use the 12-inch version.  ", "private_information")).toEqual({ valid: true, cleaned: "Use the 12-inch version." });
    expect(canRespondToBlockedWork("blocked", "Use the 12-inch version.", "private_information")).toBe(true);
  });

  it("reports input-size errors only after confirming the private-information gate", () => {
    expect(validateBlockedWorkResponse("blocked", "   ", "private_information")).toEqual({ valid: false, error: "Response must be between 1 and 4,000 characters" });
    expect(validateBlockedWorkResponse("blocked", "x".repeat(4001), "private_information")).toEqual({ valid: false, error: "Response must be between 1 and 4,000 characters" });
  });

  it("fails closed with gate-specific errors for consequential, unknown, and missing gates", () => {
    for (const gate of ["decision", "authorization", "professional_review", "payment", "physical_work", "future_unknown_gate"]) {
      expect(validateBlockedWorkResponse("blocked", "I completed it.", gate)).toEqual({ valid: false, error: `Free-form text cannot satisfy the ${gate} gate` });
    }
    expect(validateBlockedWorkResponse("blocked", "I completed it.")).toEqual({ valid: false, error: "Free-form text cannot satisfy the unknown gate" });
  });

  it("keeps consequential gate errors even when submitted text is empty or oversized", () => {
    for (const gate of ["decision", "authorization", "professional_review", "payment", "physical_work"]) {
      expect(validateBlockedWorkResponse("blocked", "   ", gate)).toEqual({ valid: false, error: `Free-form text cannot satisfy the ${gate} gate` });
      expect(validateBlockedWorkResponse("blocked", "x".repeat(4001), gate)).toEqual({ valid: false, error: `Free-form text cannot satisfy the ${gate} gate` });
    }
  });

  it("rejects replay/non-blocked work before considering input", () => {
    expect(validateBlockedWorkResponse("queued", "Use the 12-inch version.", "private_information")).toEqual({ valid: false, error: "Work item is not waiting for input" });
  });
});
