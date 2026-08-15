import { describe, expect, it } from "vitest";
import { buildPitchDeckArtifact, pitchDeckSlidesFromMarkdown } from "../../convex/pitchDeckArtifact";

describe("InventSmith pitch deck generation", () => {
  const markdown = [
    "# RiseJar — Investor Pitch",
    "- A better way to reach product at the bottom of a jar",
    "- Evidence-backed development managed by InventSmith",
    "",
    "## Problem",
    "- Users struggle to reach remaining product cleanly",
    "- Existing approaches create waste and frustration",
    "",
    "## Solution",
    "- A strategically differentiated container architecture",
    "- Product design is constrained by prior-art findings",
    "",
    "## Validation",
    "- Customer interviews and survey evidence feed the validation ledger",
    "",
    "## Product & Engineering",
    "- CAD, exploded views, BOM, prototype and manufacturing work are tracked",
    "",
    "## Funding Ask",
    "- Capital supports prototype validation and production readiness",
  ].join("\n");

  it("turns pitch narrative sections into editable slide structures", () => {
    const slides = pitchDeckSlidesFromMarkdown(markdown, "RiseJar");
    expect(slides.length).toBeGreaterThanOrEqual(6);
    expect(slides[0].title).toContain("RiseJar");
    expect(slides.some((slide) => slide.title === "Problem")).toBe(true);
    expect(slides.some((slide) => slide.title === "Product & Engineering")).toBe(true);
  });

  it("builds a real Open Packaging Convention PowerPoint container", () => {
    const artifact = buildPitchDeckArtifact(markdown, "RiseJar");
    const bytes = new Uint8Array(artifact.bytes);
    expect(artifact.slideCount).toBeGreaterThanOrEqual(6);
    expect(artifact.embeddedProductVisual).toBe(false);
    expect(Array.from(bytes.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);

    const containerText = new TextDecoder().decode(bytes);
    expect(containerText).toContain("[Content_Types].xml");
    expect(containerText).toContain("ppt/presentation.xml");
    expect(containerText).toContain("ppt/slides/slide1.xml");
    expect(containerText).toContain("InventSmith");
    expect(containerText).toContain("Modern Methods");
  });

  it("embeds the current product render into the editable PowerPoint package", () => {
    const representativePng = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    ]);
    const artifact = buildPitchDeckArtifact(markdown, "RiseJar", representativePng);
    const containerText = new TextDecoder().decode(new Uint8Array(artifact.bytes));

    expect(artifact.embeddedProductVisual).toBe(true);
    expect(containerText).toContain("ppt/media/image1.png");
    expect(containerText).toContain("relationships/image");
    expect(containerText).toContain("Evidence-backed product render");
  });
});
