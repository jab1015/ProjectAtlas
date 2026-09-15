import { describe, expect, it } from "vitest";
import {
  canResolveApproval,
  canResolveDecision,
  canRespondToBlockedWork,
  readDecisionOptionKeys,
} from "@convex/reviewLogic";

describe("inventor decision safety", () => {
  const options = [
    { key: "low_cost", label: "Lower cost" },
    { key: "premium", label: "Premium" },
  ];

  it("accepts only a listed option on an open decision", () => {
    expect(canResolveDecision("open", "low_cost", options)).toBe(true);
    expect(canResolveDecision("open", "invented_option", options)).toBe(false);
  });

  it("prevents a resolved decision from being resolved again", () => {
    expect(canResolveDecision("approved", "low_cost", options)).toBe(false);
    expect(canResolveDecision("superseded", "low_cost", options)).toBe(false);
  });

  it("ignores malformed option data", () => {
    expect(readDecisionOptionKeys([null, {}, { key: 12 }, { key: "valid" }])).toEqual(["valid"]);
  });
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
  it("accepts bounded free-form input only for an explicitly identified private-information gate", () => {
    expect(canRespondToBlockedWork("blocked", "Use the 12-inch version.", "private_information")).toBe(true);
    expect(canRespondToBlockedWork("queued", "Use the 12-inch version.", "private_information")).toBe(false);
    expect(canRespondToBlockedWork("blocked", "   ", "private_information")).toBe(false);
    expect(canRespondToBlockedWork("blocked", "x".repeat(4001), "private_information")).toBe(false);
  });

  it("fails closed when the gate type is omitted and cannot bypass consequential gates with text", () => {
    expect(canRespondToBlockedWork("blocked", "done")).toBe(false);
    for (const gate of ["decision", "authorization", "professional_review", "payment", "physical_work"]) {
      expect(canRespondToBlockedWork("blocked", "I completed it.", gate), gate).toBe(false);
    }
  });
});
