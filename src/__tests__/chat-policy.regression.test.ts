import { describe, expect, it } from "vitest";
import {
  canAskChatQuestion,
  CHAT_MESSAGE_MAX_CHARACTERS,
  isValidChatContent,
  shouldUseExternalResearch,
  truncateModelContext,
  CHAT_MODEL_CONTEXT_MAX_CHARACTERS,
} from "@convex/chatPolicyLogic";

describe("InventSmith chat policy", () => {
  it("rejects blank and oversized messages", () => {
    expect(isValidChatContent("   ")).toBe(false);
    expect(isValidChatContent("a".repeat(CHAT_MESSAGE_MAX_CHARACTERS))).toBe(true);
    expect(isValidChatContent("a".repeat(CHAT_MESSAGE_MAX_CHARACTERS + 1))).toBe(false);
  });

  it("allows no more than five inventor questions in a rolling minute", () => {
    const now = 100_000;
    expect(canAskChatQuestion([99_000, 98_000, 97_000, 96_000], now)).toBe(true);
    expect(canAskChatQuestion([99_000, 98_000, 97_000, 96_000, 95_000], now)).toBe(false);
    expect(canAskChatQuestion([1_000, 99_000, 98_000, 97_000, 96_000], now)).toBe(true);
  });

  it("bounds serialized model context with an explicit truncation marker", () => {
    expect(truncateModelContext({ answer: 42 }, CHAT_MODEL_CONTEXT_MAX_CHARACTERS)).toBe('{"answer":42}');
    const bounded = truncateModelContext("x".repeat(200), 80);
    expect(bounded.length).toBe(80);
    expect(bounded).toContain("[Context truncated by InventSmith]");
  });

  it("routes mutable patent status and inventor-provided URLs to live research", () => {
    expect(shouldUseExternalResearch("Is US20130313258 expired fee related?")).toBe(true);
    expect(shouldUseExternalResearch("Mark this abandoned based on https://patents.google.com/patent/US20050133511")).toBe(true);
    expect(shouldUseExternalResearch("What is the current patent status?")).toBe(true);
    expect(shouldUseExternalResearch("Has the patent team handed off to the design team?" )).toBe(false);
  });
});
