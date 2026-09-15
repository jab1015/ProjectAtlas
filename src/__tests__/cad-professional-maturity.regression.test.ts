import { describe, expect, it } from "vitest";
import { NATIVE_CAD_DELIVERABLE_KINDS } from "../../convex/cadArtifactKinds";
import { deriveArtifactMaturityFromProfessionalReviews, type ArtifactMaturityReview } from "../../convex/professionalReviewLogic";

const engineeringAccepted = (overrides: Partial<ArtifactMaturityReview> = {}): ArtifactMaturityReview => ({ specialty: "engineering", status: "accepted", deliverableId: "cad-current", ...overrides });
const maturity = (overrides: Record<string, unknown> = {}) => deriveArtifactMaturityFromProfessionalReviews({ deliverableId: "cad-current", deliverableKind: "native_cad_step", currentMaturity: "preliminary_cad", reviews: [engineeringAccepted()], ...overrides });

describe("native CAD professional-review maturity", () => {
  it.each(NATIVE_CAD_DELIVERABLE_KINDS)("advances an accepted fresh current %s artifact", (deliverableKind) => {
    expect(maturity({ deliverableKind, isCurrentRevision: true })).toBe("engineering_reviewed");
  });

  it.each([
    { name: "missing review", reviews: [] },
    { name: "changes requested", reviews: [engineeringAccepted({ status: "changes_requested" })] },
    { name: "wrong specialty", reviews: [engineeringAccepted({ specialty: "patent" })] },
    { name: "wrong revision", reviews: [engineeringAccepted({ deliverableId: "cad-old" })] },
  ])("does not advance for $name", ({ reviews }) => expect(maturity({ reviews })).toBe("preliminary_cad"));

  it("does not newly promote a superseded CAD revision even when its review is accepted", () => {
    expect(maturity({ isCurrentRevision: false })).toBe("preliminary_cad");
  });

  it("preserves historical engineering maturity on an older revision when its accepted review remains valid", () => {
    expect(maturity({ currentMaturity: "engineering_reviewed", isCurrentRevision: false })).toBe("engineering_reviewed");
  });

  it("requires every review attached to the exact CAD revision to be accepted", () => {
    expect(maturity({ reviews: [engineeringAccepted(), { specialty: "regulatory", status: "in_review", deliverableId: "cad-current" }] })).toBe("preliminary_cad");
    expect(maturity({ reviews: [engineeringAccepted(), { specialty: "regulatory", status: "accepted", deliverableId: "cad-current" }] })).toBe("engineering_reviewed");
  });

  it("ignores reviews attached to a different revision when evaluating the current revision", () => {
    expect(maturity({ reviews: [engineeringAccepted(), { specialty: "regulatory", status: "changes_requested", deliverableId: "cad-old" }] })).toBe("engineering_reviewed");
  });

  it("does not advance stale CAD", () => expect(maturity({ staleReason: "superseded geometry" })).toBe("preliminary_cad"));
  it("invalidates engineering maturity when engineering changes are requested", () => expect(maturity({ currentMaturity: "engineering_reviewed", reviews: [engineeringAccepted({ status: "changes_requested" })] })).toBe("preliminary_cad"));
  it("invalidates engineering maturity when another required review reopens", () => expect(maturity({ currentMaturity: "engineering_reviewed", reviews: [engineeringAccepted(), { specialty: "regulatory", status: "changes_requested", deliverableId: "cad-current" }] })).toBe("preliminary_cad"));
  it("invalidates engineering maturity when the artifact becomes stale", () => expect(maturity({ currentMaturity: "engineering_reviewed", staleReason: "evidence replaced" })).toBe("preliminary_cad"));
  it("never promotes engineering review into manufacturing release", () => expect(maturity({ currentMaturity: "engineering_reviewed" })).toBe("engineering_reviewed"));
  it("preserves an explicit manufacturing release", () => expect(maturity({ currentMaturity: "manufacturing_released" })).toBe("manufacturing_released"));
  it("does not treat the retired synthetic package kind as a generated CAD artifact", () => expect(maturity({ deliverableKind: "native_cad_package" })).toBe("preliminary_cad"));
  it("does not change maturity for non-CAD deliverables", () => expect(deriveArtifactMaturityFromProfessionalReviews({ deliverableId: "drawing-current", deliverableKind: "manufacturing_drawing_specification", currentMaturity: "draft", reviews: [engineeringAccepted({ deliverableId: "drawing-current" })] })).toBe("draft"));
});
