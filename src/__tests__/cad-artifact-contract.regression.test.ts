import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { NATIVE_CAD_DELIVERABLE_KINDS } from "@convex/cadArtifactKinds";

const generationSource = readFileSync(resolve(process.cwd(), "convex/nativeCadGeneration.ts"), "utf8");
const persistenceSource = readFileSync(resolve(process.cwd(), "convex/nativeCad.ts"), "utf8");

describe("native CAD artifact contract", () => {
  it("keeps the maturity contract aligned with every artifact the generator actually emits", () => {
    expect(new Set(NATIVE_CAD_DELIVERABLE_KINDS).size).toBe(6);
    for (const kind of NATIVE_CAD_DELIVERABLE_KINDS) {
      expect(generationSource).toContain(`kind: \"${kind}\"`);
    }
    expect(generationSource).not.toContain('kind: "native_cad_package"');
  });

  it("persists generated CAD as preliminary and creates exact engineering-review rows", () => {
    expect(persistenceSource).toContain('artifactMaturity: "preliminary_cad"');
    expect(persistenceSource).toContain('trustState: "professional_review_required"');
    expect(persistenceSource).toContain('ctx.db.insert("professionalReviews"');
    expect(persistenceSource).toContain('specialty: "engineering"');
    expect(persistenceSource).toContain('deliverableId');
  });
});
