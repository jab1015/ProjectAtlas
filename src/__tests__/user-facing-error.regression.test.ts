import { describe, expect, it } from "vitest";
import { userFacingError } from "@/lib/userFacingError";

describe("safe user-facing errors", () => {
  it("preserves concise actionable validation messages", () => {
    expect(userFacingError(new Error("ConvexError: You need edit access to upload evidence."), "Try again.")).toBe("You need edit access to upload evidence.");
  });

  it("hides request identifiers and internal runtime failures", () => {
    const fallback = "Please retry or contact support.";
    expect(userFacingError(new Error("Request ID: abc-123"), fallback)).toBe(fallback);
    expect(userFacingError(new TypeError("Cannot read properties of undefined"), fallback)).toBe(fallback);
    expect(userFacingError(new Error("Error: Internal Server Error"), fallback)).toBe(fallback);
  });
});
