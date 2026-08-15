import { afterEach, describe, expect, it, vi } from "vitest";
import { buildAtlasPackageFilename, selectLatestDeliverables, validatePackageExportSize } from "@/lib/packageExportLogic";
import { exportAtlasPackageDocx, exportAtlasPackagePdf, type AtlasPackageExport } from "@/lib/packageExport";

const representativePackage: AtlasPackageExport = {
  inventionTitle: "Adjustable Produce Rinsing Rack",
  generatedAt: 1_725_000_000_000,
  qualityPassed: false,
  qualityBlockers: ["Professional patent review is still required."],
  deliverables: [{
    kind: "invention_brief",
    title: "Invention Brief",
    version: 2,
    trustLabel: "Evidence checked",
    content: "A countertop rack supports produce above a sink while rinsing.\n\nThis is representative pilot content.",
    sourceCoverage: 0.75,
    confidence: 0.82,
    searchDate: 1_725_000_000_000,
    assumptions: ["Target sinks use common residential dimensions."],
    limitations: ["No production engineering review has occurred."],
    missingInformation: ["Final material selection."],
    sources: [{ id: "source-1", title: "Representative source", locator: "https://example.com/source", reliability: "authoritative_secondary" }],
    reviews: [{ specialty: "patent", status: "required", scope: "Review patentability-related drafting before external reliance." }],
  }],
};

function installDownloadCapture() {
  const blobs: Blob[] = [];
  const filenames: string[] = [];
  const originalDocument = globalThis.document;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  URL.createObjectURL = vi.fn((blob: Blob | MediaSource) => {
    if (blob instanceof Blob) blobs.push(blob);
    return "blob:atlas-test";
  });
  URL.revokeObjectURL = vi.fn();
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement: () => ({
        href: "",
        set download(value: string) { filenames.push(value); },
        click: vi.fn(),
      }),
    },
  });

  return {
    blobs,
    filenames,
    restore() {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      if (originalDocument === undefined) delete (globalThis as { document?: Document }).document;
      else Object.defineProperty(globalThis, "document", { configurable: true, value: originalDocument });
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Atlas package export", () => {
  it("creates a filesystem-safe descriptive filename", () => {
    expect(buildAtlasPackageFilename("Sink Rack: Version 2!", "pdf")).toBe("sink-rack-version-2-atlas-feasibility-package.pdf");
  });

  it("exports only the newest version of each deliverable kind", () => {
    const selected = selectLatestDeliverables([
      { kind: "brief", version: 1, value: "old" },
      { kind: "market", version: 1, value: "market" },
      { kind: "brief", version: 2, value: "new" },
    ]);
    expect(selected).toHaveLength(2);
    expect(selected.find((item) => item.kind === "brief")?.value).toBe("new");
  });

  it("fails closed before an oversized package can exhaust the browser", () => {
    expect(validatePackageExportSize([{ content: "x".repeat(1_000_001) }])).toMatch(/too large/i);
    expect(validatePackageExportSize(Array.from({ length: 51 }, () => ({ content: "ok" })))).toMatch(/50 deliverables/i);
    expect(validatePackageExportSize([{ content: "normal package" }])).toBeNull();
  });

  it("generates a structurally valid DOCX archive from a representative package", async () => {
    const capture = installDownloadCapture();
    try {
      await exportAtlasPackageDocx(representativePackage);
      expect(capture.blobs).toHaveLength(1);
      expect(capture.filenames[0]).toBe("adjustable-produce-rinsing-rack-atlas-feasibility-package.docx");
      const bytes = new Uint8Array(await capture.blobs[0].arrayBuffer());
      expect(bytes.length).toBeGreaterThan(2_000);
      expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK");
    } finally {
      capture.restore();
    }
  }, 15_000);

  it("generates a structurally valid PDF from a representative package", async () => {
    const capture = installDownloadCapture();
    try {
      await exportAtlasPackagePdf(representativePackage);
      expect(capture.blobs).toHaveLength(1);
      expect(capture.filenames[0]).toBe("adjustable-produce-rinsing-rack-atlas-feasibility-package.pdf");
      const bytes = new Uint8Array(await capture.blobs[0].arrayBuffer());
      expect(bytes.length).toBeGreaterThan(1_000);
      expect(new TextDecoder().decode(bytes.slice(0, 8))).toMatch(/^%PDF-/);
    } finally {
      capture.restore();
    }
  }, 15_000);
});
