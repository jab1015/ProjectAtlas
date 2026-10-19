import { describe, expect, it } from "vitest";
import { getFailedWorkItems } from "@/lib/workFailureView";

describe("work library compatibility with older backend responses", () => {
  it("treats the newly added failure list as optional until the backend is deployed", () => {
    expect(getFailedWorkItems({})).toEqual([]);
    expect(getFailedWorkItems(null)).toEqual([]);
    expect(getFailedWorkItems(undefined)).toEqual([]);
  });

  it("preserves failure summaries when the backend returns them", () => {
    const failure = { kind: "validation", title: "Validation", attemptCount: 2, updatedAt: 123, summary: "Try again later." };
    expect(getFailedWorkItems({ failedWork: [failure] })).toEqual([failure]);
  });
});
