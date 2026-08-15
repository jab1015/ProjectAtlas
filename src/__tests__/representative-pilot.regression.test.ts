import { describe, expect, it } from "vitest";
import { evaluatePilotPackage } from "@convex/pilotEvaluationLogic";
import {
  makeRepresentativePilotEvaluationInput,
  representativeEvaluationTime,
  representativeInvention,
} from "../__fixtures__/representativeInvention";

describe("representative controlled-pilot fixture", () => {
  it("stays inside the initial standard-risk physical-product scope", () => {
    expect(representativeInvention.riskClass).toBe("standard");
    expect(representativeInvention.solutionDescription).toContain("manually adjustable");
  });

  it("passes only when the complete evidence-checked package is present", () => {
    const complete = makeRepresentativePilotEvaluationInput();
    expect(evaluatePilotPackage(complete, representativeEvaluationTime).passed).toBe(true);

    const missingPriorArt = {
      ...complete,
      deliverables: complete.deliverables.filter((item) => item.kind !== "preliminary_prior_art_landscape"),
    };
    const result = evaluatePilotPackage(missingPriorArt, representativeEvaluationTime);
    expect(result.passed).toBe(false);
    expect(result.missingDeliverableKinds).toContain("preliminary_prior_art_landscape");
  });

  it("fails closed when a sourced claim loses its source", () => {
    const input = makeRepresentativePilotEvaluationInput();
    input.findings[0] = { ...input.findings[0], sourceIds: [] };
    const result = evaluatePilotPackage(input, representativeEvaluationTime);
    expect(result.passed).toBe(false);
    expect(result.metrics.unsupportedSourcedFacts).toBe(1);
  });
});
