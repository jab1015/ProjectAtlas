import { describe, expect, it } from "vitest";
import { buildAtlasPackageFilename, selectLatestDeliverables, validatePackageExportSize } from "@/lib/packageExportLogic";

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
});
