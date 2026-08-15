import { describe, expect, it } from "vitest";
import { triageInventionRisk } from "@convex/riskTriageLogic";
import { REPRESENTATIVE_PILOT_INTAKE } from "@/lib/representativePilot";
import { representativeInvention } from "@/../src/__fixtures__/representativeInvention";

describe("representative pilot launcher", () => {
  it("uses the same intake data as the representative evaluation fixture", () => {
    expect(representativeInvention).toMatchObject(REPRESENTATIVE_PILOT_INTAKE);
  });

  it("remains inside the controlled pilot's non-safety-critical scope", () => {
    expect(triageInventionRisk(REPRESENTATIVE_PILOT_INTAKE)).toEqual({ restricted: false, categories: [] });
  });
});
