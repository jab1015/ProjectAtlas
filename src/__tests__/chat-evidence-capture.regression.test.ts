import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chatEvidenceKind, extractChatEvidenceUrls, shouldCaptureChatAsInventorEvidence } from "../../convex/chatEvidenceLogic";

describe("Ask InventSmith material-input capture", () => {
  it("recognizes patent-status observations and preserves supplied URLs", () => {
    const input = [
      "Use these. US20130313258A1 shows expired fee related and I found US20050133511A1 marked abandoned.",
      "https://patents.google.com/patent/US20130313258",
      "https://patents.google.com/patent/US20050133511",
    ].join(" ");
    expect(shouldCaptureChatAsInventorEvidence(input)).toBe(true);
    expect(chatEvidenceKind(input)).toBe("prior_art");
    expect(extractChatEvidenceUrls(input)).toEqual([
      "https://patents.google.com/patent/US20130313258",
      "https://patents.google.com/patent/US20050133511",
    ]);
  });

  it("captures real inventor survey, prototype and quote observations but ignores routine project questions", () => {
    expect(shouldCaptureChatAsInventorEvidence("I surveyed 100 people and 72 said they would buy at $29.")).toBe(true);
    expect(chatEvidenceKind("I surveyed 100 people and 72 said they would buy at $29.")).toBe("customer_discovery");
    expect(shouldCaptureChatAsInventorEvidence("The prototype test failed at 18 pounds of load.")).toBe(true);
    expect(chatEvidenceKind("The prototype test failed at 18 pounds of load.")).toBe("prototype_test");
    expect(shouldCaptureChatAsInventorEvidence("The manufacturer quote was $2.14 each at 5,000 units.")).toBe(true);
    expect(chatEvidenceKind("The manufacturer quote was $2.14 each at 5,000 units.")).toBe("manufacturer_quote");
    expect(shouldCaptureChatAsInventorEvidence("What is the design team doing now?")).toBe(false);
  });

  it("stores captured chat material as inventor-provided unverified evidence and refreshes downstream work", () => {
    const capture = readFileSync(join(process.cwd(), "convex/chatEvidenceCapture.ts"), "utf8");
    const chatPage = readFileSync(join(process.cwd(), "src/app/(app)/invention/[id]/chat/page.tsx"), "utf8");
    expect(capture).toContain('sourceType: "inventor_statement"');
    expect(capture).toContain('reliability: "unverified"');
    expect(capture).toContain('provenance: "inventor_chat"');
    expect(capture).toContain('kind: "inventor_statement"');
    expect(capture).toContain('status: "draft"');
    expect(capture).toContain("has not been independently verified");
    expect(capture).toContain("applyInventorEvidenceChange");
    expect(chatPage).toContain("captureInventorChatEvidence");
    expect(chatPage).toContain("Material inventor input can become project evidence");
  });
});
