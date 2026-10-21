import { describe, expect, it } from "vitest";

import { assessContextOnlyValidationConfidence } from "../../convex/validationConfidenceLogic";
import type { InventionContext } from "../../convex/validationResearchProvider";

const context: InventionContext = {
  inventionId: "inv_confidence_test",
  title: "Evidence-aware test invention",
  problemStatement: "A stated inventor problem that has not yet been independently validated.",
  inventionDescription: "An inventor-supplied description used only as context.",
  founderNotes: "Founder believes customers will pay more, but has not supplied interview evidence.",
};

describe("context-only validation confidence", () => {
  it("never reports high confidence without independent retrieval evidence", () => {
    const assessment = assessContextOnlyValidationConfidence(context, "validationPlan");

    expect(assessment.score).toBeLessThan(0.5);
    expect(["low", "very_low"]).toContain(assessment.level);
    expect(assessment.evidenceSummary).toContain("inventor-provided");
    expect(assessment.evidenceSummary).toContain("AI inferences");
  });

  it("is more conservative for sections that require current external evidence", () => {
    const plan = assessContextOnlyValidationConfidence(context, "validationPlan");
    const market = assessContextOnlyValidationConfidence(context, "marketSizing");

    expect(market.score).toBeLessThan(plan.score);
    expect(market.missingInformation.join(" ")).toContain("current external sources");
  });

  it("keeps missing evidence visible instead of treating absent evidence as zero risk", () => {
    const assessment = assessContextOnlyValidationConfidence(context, "competitorAnalysis");

    expect(assessment.missingInformation).toContain(
      "Independent retrieval/source records have not been collected by this provider."
    );
    expect(assessment.assumptions.join(" ")).toContain("hypotheses pending evidence");
  });

  it("credits an extracted inventor survey for customer-validation sections only", () => {
    const withSurvey: InventionContext = {
      ...context,
      inventorEvidence: [{
        sourceId: "survey-1",
        title: "RiseJar SurveyMonkey results",
        evidenceKind: "survey",
        provenance: "inventor_upload",
        extraction: {
          keyFindings: [{ statement: "100 respondents answered RiseJar questions.", confidence: 0.9, basis: "document_observation" }],
        },
      }],
    };
    const customer = assessContextOnlyValidationConfidence(withSurvey, "customerSegments");
    const patent = assessContextOnlyValidationConfidence(withSurvey, "competitorAnalysis");
    expect(customer.score).toBeGreaterThan(assessContextOnlyValidationConfidence(context, "customerSegments").score);
    expect(customer.level).toBe("moderate");
    expect(customer.evidenceSummary).toContain("Survey observations strengthen customer-validation evidence support");
    expect(patent.score).toBe(assessContextOnlyValidationConfidence(context, "competitorAnalysis").score);
  });

  it("recognizes a SurveyMonkey/PDF extraction when it contains a sample size and summary", () => {
    const withPdfSurvey: InventionContext = {
      ...context,
      inventorEvidence: [{
        sourceId: "survey-pdf",
        title: "Data_All_260313",
        evidenceKind: "survey",
        provenance: "inventor_upload",
        extraction: {
          mode: "ai_file",
          documentType: "Survey / SurveyMonkey results",
          sampleSize: "100 users",
          summary: "Two survey result sections with responses about RiseJars.",
          keyFindings: [],
        },
      }],
    };
    const assessment = assessContextOnlyValidationConfidence(withPdfSurvey, "customerSegments");
    expect(assessment.score).toBeGreaterThan(0.3);
    expect(assessment.evidenceSummary).toContain("100 reported respondents");
  });

  it("counts anonymous public survey responses as validation evidence", () => {
    const withResponses: InventionContext = {
      ...context,
      inventorEvidence: [1, 2].map((index) => ({
        sourceId: `public-response-${index}`,
        title: "Rise Jar survey response",
        evidenceKind: "survey",
        provenance: "inventor_upload",
        extraction: {
          mode: "public_response",
          documentType: "public_survey_response",
          sampleSize: 1,
          survey: { rowCount: 1 },
        },
      })),
    };
    const assessment = assessContextOnlyValidationConfidence(withResponses, "validationPlan");
    expect(assessment.score).toBeGreaterThan(assessContextOnlyValidationConfidence(context, "validationPlan").score);
    expect(assessment.evidenceSummary).toContain("2 reported respondents");
    expect(assessment.missingInformation.join(" ")).toContain("not been independently verified");
  });

  it("moves the overall 11-section evidence-support score when a survey is included", () => {
    const sections = [
      "validationPlan", "customerSegments", "competitorAnalysis", "marketSizing",
      "validationMethods", "timeline", "surveyQuestions", "landingPageDraft",
      "interviewQuestions", "riskAssessment", "recommendations",
    ] as const;
    const withoutSurvey = sections.reduce((sum, section) => sum + assessContextOnlyValidationConfidence(context, section).score, 0) / sections.length;
    const withSurveyContext: InventionContext = {
      ...context,
      inventorEvidence: [{
        sourceId: "risejars-survey",
        title: "SurveyMonkey survey results",
        evidenceKind: "survey",
        provenance: "inventor_upload",
        extraction: { documentType: "SurveyMonkey results", sampleSize: "100 users", summary: "Questions about RiseJars." },
      }],
    };
    const withSurvey = sections.reduce((sum, section) => sum + assessContextOnlyValidationConfidence(withSurveyContext, section).score, 0) / sections.length;

    expect(Math.round(withoutSurvey * 100)).toBe(36);
    expect(Math.round(withSurvey * 100)).toBeGreaterThan(Math.round(withoutSurvey * 100));
  });
});
