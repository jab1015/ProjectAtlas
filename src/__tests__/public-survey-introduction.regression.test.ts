import { describe, expect, it } from "vitest";
import { publicSurveyIntroduction } from "@/lib/publicSurveyIntroduction";

describe("public survey introductions", () => {
  it("replaces generated legacy copy that can contain stale scores or truncated invention details", () => {
    expect(publicSurveyIntroduction("InventSmith prepared this short survey because the current evidence score is 45%. Please share it with people: which creates frustration, mess, wasted ."))
      .toContain("Responses are collected as customer-validation signals");
    expect(publicSurveyIntroduction("InventSmith prepared this short survey because the current evidence score is 45%. Please share it"))
      .not.toContain("45%");
  });

  it("preserves introductions written by the inventor", () => {
    expect(publicSurveyIntroduction("Please tell us what you think."))
      .toBe("Please tell us what you think.");
  });
});
