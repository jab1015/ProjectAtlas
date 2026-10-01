import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FULL_JOURNEY_STAGES } from "../../convex/fullJourneyDefinition";
import { INVENTSMITH_PUBLIC_JOURNEY } from "../lib/inventsmithJourney";

describe("InventSmith public journey alignment", () => {
  it("matches the engine-owned 15-stage journey exactly", () => {
    expect(INVENTSMITH_PUBLIC_JOURNEY).toHaveLength(15);
    expect(INVENTSMITH_PUBLIC_JOURNEY.map(({ id, name }) => ({ id, name }))).toEqual(
      FULL_JOURNEY_STAGES.map(({ id, name }) => ({ id, name }))
    );
  });

  it("keeps the landing and public Journey page on the shared definition", () => {
    const landing = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");
    const journey = readFileSync(join(process.cwd(), "src/app/(public)/journey/page.tsx"), "utf8");
    expect(landing).toContain("INVENTSMITH_PUBLIC_JOURNEY.map");
    expect(journey).toContain("INVENTSMITH_PUBLIC_JOURNEY.map");
    expect(landing).not.toContain('"Engineering",');
    expect(landing).not.toContain('"Testing",');
    expect(journey).not.toContain('name: "Patent Research"');
  });

  it("does not expose the legacy Atlas contact address on the landing page", () => {
    const landing = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");
    expect(landing).not.toContain("team@atlas.madethis.app");
    expect(landing).toContain("support@madethis.com");
  });
});
