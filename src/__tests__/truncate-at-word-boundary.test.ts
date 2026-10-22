import { describe, expect, it } from "vitest";
import { truncateAtWordBoundary } from "@/lib/truncateAtWordBoundary";

describe("truncateAtWordBoundary", () => {
  it("preserves complete words and marks truncated text", () => {
    expect(truncateAtWordBoundary("A useful short phrase continues", 20)).toBe("A useful short…");
  });

  it("keeps short text intact", () => {
    expect(truncateAtWordBoundary("A short phrase", 20)).toBe("A short phrase");
  });

  it("still makes progress when the first word exceeds the limit", () => {
    expect(truncateAtWordBoundary("extraordinarilylongword here", 8)).toBe("extraord…");
  });
});
