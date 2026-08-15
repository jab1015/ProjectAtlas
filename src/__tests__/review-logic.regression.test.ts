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
  it("accepts meaningful inventor input only while work is blocked", () => {
    expect(canRespondToBlockedWork("blocked", "Use the 12-inch version.")).toBe(true);
    expect(canRespondToBlockedWork("queued", "Use the 12-inch version.")).toBe(false);
    expect(canRespondToBlockedWork("blocked", "   ")).toBe(false);
  });
});
