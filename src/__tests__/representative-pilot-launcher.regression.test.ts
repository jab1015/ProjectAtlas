import { describe, expect, it } from "vitest";
import { triageInventionRisk } from "@convex/riskTriageLogic";
import { REPRESENTATIVE_PILOT_INTAKE } from "@/lib/representativePilot";
import { representativeInvention } from "../__fixtures__/representativeInvention";

describe("representative invention launcher", () => {
  it("uses the same intake data as the representative evaluation fixture", () => {
    expect(representativeInvention).toMatchObject(REPRESENTATIVE_PILOT_INTAKE);
  });

  it("remains a standard supported invention under current InventSmith triage", () => {
    expect(triageInventionRisk(REPRESENTATIVE_PILOT_INTAKE)).toMatchObject({
      restricted: false,
      professionalReviewRequired: false,
      categories: [],
    });
  });
});
