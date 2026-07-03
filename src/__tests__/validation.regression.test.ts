/**
 * Regression Tests — Stage 2 Validation Backend Foundation
 *
 * Tests:
 *   1. MockValidationResearchProvider returns all 11 required sections.
 *   2. Content is NOT hardcoded — title from context appears in at least one section.
 *   3. status transitions: running → complete (simulated via applyApproval/applyEdit logic).
 *   4. approveValidationSection: status → "approved", approvedAt recorded.
 *   5. editValidationSection: editedContent and status → "edited" persisted.
 *   6. refreshValidationSection: only the target section is updated.
 *
 * Run with: npx vitest run src/__tests__/validation.regression.test.ts
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  MockValidationResearchProvider,
  ALL_SECTION_IDS,
  buildSectionById,
  findSection,
  applyApproval,
  applyEdit,
  applyRefresh,
  type InventionContext,
  type ValidationSection,
  type ValidationResearchResult,
} from "@/lib/validationLogic";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const UNIQUE_TITLE = "UniqueInventionTitle_XYZ_7842";

const CONTEXT: InventionContext = {
  title: UNIQUE_TITLE,
  problemStatement:
    "Current solutions are inefficient and cause unnecessary friction for end users.",
  description:
    "A novel mechanism that reduces friction by 80% through a patented lever-assist design.",
};

// ── Test 1 — MockProvider returns all 11 required sections ────────────────────

describe("MockValidationResearchProvider — section completeness", () => {
  let result: ValidationResearchResult;

  beforeAll(async () => {
    const provider = new MockValidationResearchProvider();
    result = await provider.runResearch(
      CONTEXT,
      "inv_test_001",
      "run_test_001",
      Date.now()
    );
  }, 5000); // Allow up to 5s for the mock delay

  it("returns status 'complete'", () => {
    expect(result.status).toBe("complete");
  });

  it("returns exactly 11 sections", () => {
    expect(result.sections).toHaveLength(11);
  });

  it("returns all 11 required section IDs", () => {
    const returnedIds = result.sections.map((s) => s.sectionId);
    for (const required of ALL_SECTION_IDS) {
      expect(returnedIds).toContain(required);
    }
  });

  it("every section has a non-empty title", () => {
    for (const section of result.sections) {
      expect(section.title.trim().length).toBeGreaterThan(0);
    }
  });

  it("every section has a non-empty content string", () => {
    for (const section of result.sections) {
      expect(section.content.trim().length).toBeGreaterThan(0);
    }
  });

  it("every section has a confidence object with required fields", () => {
    for (const section of result.sections) {
      expect(typeof section.confidence.score).toBe("number");
      expect(section.confidence.score).toBeGreaterThanOrEqual(0);
      expect(section.confidence.score).toBeLessThanOrEqual(1);
      expect(["very_high", "high", "moderate", "low", "very_low"]).toContain(
        section.confidence.level
      );
      expect(typeof section.confidence.evidenceSummary).toBe("string");
      expect(Array.isArray(section.confidence.assumptions)).toBe(true);
      expect(Array.isArray(section.confidence.missingInformation)).toBe(true);
    }
  });

  it("every section has generatedAt set as a number", () => {
    for (const section of result.sections) {
      expect(typeof section.generatedAt).toBe("number");
      expect(section.generatedAt).toBeGreaterThan(0);
    }
  });

  it("every section has status 'generated'", () => {
    for (const section of result.sections) {
      expect(section.status).toBe("generated");
    }
  });

  it("result includes inventionId, researchRunId, triggeredAt, completedAt", () => {
    expect(result.inventionId).toBe("inv_test_001");
    expect(result.researchRunId).toBe("run_test_001");
    expect(typeof result.triggeredAt).toBe("number");
    expect(typeof result.completedAt).toBe("number");
  });
});

// ── Test 2 — No hardcoded content; title from context appears in content ────────

describe("MockValidationResearchProvider — no hardcoded content", () => {
  let result: ValidationResearchResult;

  beforeAll(async () => {
    const provider = new MockValidationResearchProvider();
    result = await provider.runResearch(
      CONTEXT,
      "inv_test_002",
      "run_test_002",
      Date.now()
    );
  }, 5000);

  it("at least one section's content contains the invention title", () => {
    const anyContainsTitle = result.sections.some((s) =>
      s.content.includes(UNIQUE_TITLE)
    );
    expect(anyContainsTitle).toBe(true);
  });

  it("no section contains the word 'Rise' as hardcoded content", () => {
    // Ensure the provider doesn't smuggle in Rise Jars example content
    for (const section of result.sections) {
      // Allow "Rise" only if it appears as part of UNIQUE_TITLE (which it doesn't)
      // If content contains "Rise Jars", that's a violation
      expect(section.content).not.toContain("Rise Jars");
    }
  });

  it("no section contains 'jar' (case-insensitive) as hardcoded product reference", () => {
    for (const section of result.sections) {
      // Should not mention jars unless the test context title/description mentions it
      // Our context doesn't mention jars at all
      expect(section.content.toLowerCase()).not.toContain(" jar ");
    }
  });

  it("problem statement from context appears in at least one section", () => {
    const fragment = "unnecessary friction";
    const anyContains = result.sections.some((s) => s.content.includes(fragment));
    expect(anyContains).toBe(true);
  });
});

// ── Test 3 — Status transitions: simulated running → complete ─────────────────

describe("Validation research row status transitions", () => {
  it("running row has no sectionsJson and status='running'", () => {
    // Simulate what triggerValidationResearch creates
    const runningRow = {
      inventionId: "inv_001",
      researchRunId: "run_001",
      triggeredAt: Date.now(),
      status: "running" as const,
      sectionsJson: undefined,
    };
    expect(runningRow.status).toBe("running");
    expect(runningRow.sectionsJson).toBeUndefined();
  });

  it("complete row has status='complete', completedAt, and sectionsJson", async () => {
    const provider = new MockValidationResearchProvider();
    const result = await provider.runResearch(
      CONTEXT,
      "inv_001",
      "run_001",
      Date.now()
    );

    // Simulate what markResearchComplete writes
    const completeRow = {
      status: result.status,
      completedAt: result.completedAt,
      sectionsJson: JSON.stringify(result.sections),
    };

    expect(completeRow.status).toBe("complete");
    expect(typeof completeRow.completedAt).toBe("number");
    expect(typeof completeRow.sectionsJson).toBe("string");
    expect(JSON.parse(completeRow.sectionsJson)).toHaveLength(11);
  });
});

// ── Test 4 — approveValidationSection: status "approved", approvedAt set ───────

describe("applyApproval — approve a validation section", () => {
  let sections: ValidationSection[];

  beforeAll(async () => {
    const provider = new MockValidationResearchProvider();
    const result = await provider.runResearch(
      CONTEXT,
      "inv_003",
      "run_003",
      Date.now()
    );
    sections = result.sections;
  }, 5000);

  it("section status changes to 'approved'", () => {
    const approvedAt = Date.now();
    const updated = applyApproval(sections, "validationPlan", approvedAt);
    const section = findSection(updated, "validationPlan");
    expect(section?.status).toBe("approved");
  });

  it("approvedAt is recorded correctly", () => {
    const approvedAt = 1234567890000;
    const updated = applyApproval(sections, "validationPlan", approvedAt);
    const section = findSection(updated, "validationPlan");
    expect(section?.approvedAt).toBe(approvedAt);
  });

  it("other sections are not affected by approving one section", () => {
    const approvedAt = Date.now();
    const updated = applyApproval(sections, "validationPlan", approvedAt);
    for (const s of updated) {
      if (s.sectionId !== "validationPlan") {
        expect(s.status).toBe("generated");
        expect(s.approvedAt).toBeUndefined();
      }
    }
  });

  it("throws-style check: findSection returns undefined for unknown sectionId", () => {
    const unknown = findSection(sections, "nonExistentSection");
    expect(unknown).toBeUndefined();
  });
});

// ── Test 5 — editValidationSection: editedContent and status "edited" persisted ─

describe("applyEdit — edit a validation section", () => {
  let sections: ValidationSection[];

  beforeAll(async () => {
    const provider = new MockValidationResearchProvider();
    const result = await provider.runResearch(
      CONTEXT,
      "inv_004",
      "run_004",
      Date.now()
    );
    sections = result.sections;
  }, 5000);

  it("section status changes to 'edited'", () => {
    const edited = applyEdit(sections, "recommendations", "My custom content.", Date.now());
    const section = findSection(edited, "recommendations");
    expect(section?.status).toBe("edited");
  });

  it("editedContent is persisted correctly", () => {
    const myContent = "Custom founder content for testing.";
    const edited = applyEdit(sections, "recommendations", myContent, Date.now());
    const section = findSection(edited, "recommendations");
    expect(section?.editedContent).toBe(myContent);
  });

  it("editedAt is recorded", () => {
    const editedAt = 9999888777000;
    const edited = applyEdit(sections, "recommendations", "anything", editedAt);
    const section = findSection(edited, "recommendations");
    expect(section?.editedAt).toBe(editedAt);
  });

  it("original content is preserved alongside editedContent", () => {
    const edited = applyEdit(sections, "recommendations", "override", Date.now());
    const section = findSection(edited, "recommendations");
    // Original content should still be present
    expect(typeof section?.content).toBe("string");
    expect(section?.content.length).toBeGreaterThan(0);
  });

  it("other sections are unaffected", () => {
    const edited = applyEdit(sections, "recommendations", "test", Date.now());
    for (const s of edited) {
      if (s.sectionId !== "recommendations") {
        expect(s.editedContent).toBeUndefined();
        expect(s.editedAt).toBeUndefined();
      }
    }
  });
});

// ── Test 6 — refreshValidationSection: only target section is updated ──────────

describe("applyRefresh — refresh a single section", () => {
  let sections: ValidationSection[];

  beforeAll(async () => {
    const provider = new MockValidationResearchProvider();
    const result = await provider.runResearch(
      CONTEXT,
      "inv_005",
      "run_005",
      Date.now()
    );
    sections = result.sections;
  }, 5000);

  it("refreshed section gets new generatedAt", async () => {
    const provider = new MockValidationResearchProvider();
    // Small delay to ensure timestamps differ
    await new Promise((r) => setTimeout(r, 10));
    const freshSection = await provider.runSingleSection(CONTEXT, "riskAssessment");

    const updated = applyRefresh(sections, freshSection);
    const section = findSection(updated, "riskAssessment");

    expect(section?.generatedAt).toBe(freshSection.generatedAt);
  }, 5000);

  it("refreshed section status is reset to 'generated'", async () => {
    // First, approve the section
    const approvedSections = applyApproval(sections, "riskAssessment", Date.now());
    expect(findSection(approvedSections, "riskAssessment")?.status).toBe("approved");

    // Then refresh it
    const provider = new MockValidationResearchProvider();
    const freshSection = await provider.runSingleSection(CONTEXT, "riskAssessment");
    const refreshedSections = applyRefresh(approvedSections, freshSection);

    expect(findSection(refreshedSections, "riskAssessment")?.status).toBe("generated");
  }, 5000);

  it("only the target section is modified — all other sections are unchanged", async () => {
    const provider = new MockValidationResearchProvider();
    const freshSection = await provider.runSingleSection(CONTEXT, "riskAssessment");
    const updated = applyRefresh(sections, freshSection);

    for (const s of updated) {
      if (s.sectionId !== "riskAssessment") {
        const original = findSection(sections, s.sectionId);
        expect(s.generatedAt).toBe(original?.generatedAt);
        expect(s.content).toBe(original?.content);
      }
    }
  }, 5000);

  it("runSingleSection returns a section with the correct sectionId", async () => {
    const provider = new MockValidationResearchProvider();
    const section = await provider.runSingleSection(CONTEXT, "surveyQuestions");
    expect(section.sectionId).toBe("surveyQuestions");
  }, 5000);
});

// ── ALL_SECTION_IDS completeness check ───────────────────────────────────────

describe("ALL_SECTION_IDS — completeness", () => {
  it("contains exactly 11 section IDs", () => {
    expect(ALL_SECTION_IDS).toHaveLength(11);
  });

  it("contains all expected section IDs", () => {
    const expected = [
      "validationPlan",
      "customerSegments",
      "competitorAnalysis",
      "marketSizing",
      "validationMethods",
      "validationTimeline",
      "surveyQuestions",
      "landingPageDraft",
      "interviewQuestions",
      "riskAssessment",
      "recommendations",
    ];
    for (const id of expected) {
      expect(ALL_SECTION_IDS).toContain(id);
    }
  });

  it("buildSectionById returns a section for every known sectionId", () => {
    const ts = Date.now();
    for (const id of ALL_SECTION_IDS) {
      const section = buildSectionById(id, CONTEXT, ts);
      expect(section.sectionId).toBe(id);
      expect(section.content.length).toBeGreaterThan(0);
    }
  });

  it("buildSectionById throws for unknown sectionId", () => {
    expect(() => buildSectionById("unknownSection", CONTEXT, Date.now())).toThrow();
  });
});
