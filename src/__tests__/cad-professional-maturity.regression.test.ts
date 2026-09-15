import { describe, expect, it } from "vitest";
import { deriveArtifactMaturityFromProfessionalReviews, type ArtifactMaturityReview } from "../../convex/professionalReviewLogic";

const engineeringAccepted = (overrides: Partial<ArtifactMaturityReview> = {}): ArtifactMaturityReview => ({ specialty: "engineering", status: "accepted", deliverableId: "cad-current", ...overrides });
const maturity = (overrides: Record<string, unknown> = {}) => deriveArtifactMaturityFromProfessionalReviews({ deliverableId: "cad-current", deliverableKind: "native_cad_package", currentMaturity: "preliminary_cad", reviews: [engineeringAccepted()], ...overrides });

describe("native CAD professional-review maturity", () => {
  it("advances only the exact fresh native CAD revision after accepted engineering review", () => expect(maturity()).toBe("engineering_reviewed"));

  it.each([
    { name: "missing review", reviews: [] },
    { name: "changes requested", reviews: [engineeringAccepted({ status: "changes_requested" })] },
    { name: "wrong specialty", reviews: [engineeringAccepted({ specialty: "patent" })] },
    { name: "wrong revision", reviews: [engineeringAccepted({ deliverableId: "cad-old" })] },
  ])("does not advance for $name", ({ reviews }) => expect(maturity({ reviews })).toBe("preliminary_cad"));

  it("does not advance stale CAD", () => expect(maturity({ staleReason: "superseded geometry" })).toBe("preliminary_cad"));

  it("invalidates engineering maturity when engineering changes are requested", () => expect(maturity({ currentMaturity: "engineering_reviewed", reviews: [engineeringAccepted({ status: "changes_requested" })] })).toBe("preliminary_cad"));

  it("invalidates engineering maturity when the artifact becomes stale", () => expect(maturity({ currentMaturity: "engineering_reviewed", staleReason: "evidence replaced" })).toBe("preliminary_cad"));

  it("never promotes engineering review into manufacturing release", () => expect(maturity({ currentMaturity: "engineering_reviewed" })).toBe("engineering_reviewed"));

  it("preserves an explicit manufacturing release", () => expect(maturity({ currentMaturity: "manufacturing_released" })).toBe("manufacturing_released"));

  it("does not change maturity for non-CAD deliverables", () => expect(deriveArtifactMaturityFromProfessionalReviews({ deliverableId: "drawing-current", deliverableKind: "manufacturing_drawing_specification", currentMaturity: "draft", reviews: [engineeringAccepted({ deliverableId: "drawing-current" })] })).toBe("draft"));
});
