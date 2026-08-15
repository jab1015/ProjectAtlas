import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { csvDataUrl, extractMarkdownTables, financialModelMarkdownToCsv } from "../../convex/tabularExportLogic";

describe("InventSmith financial model structured export", () => {
  const markdown = [
    "# Three-Year Financial Model",
    "",
    "## Revenue and units",
    "| Metric | Year 1 | Year 2 | Year 3 |",
    "| --- | ---: | ---: | ---: |",
    "| Units | 5,000 | 15,000 | 30,000 |",
    "| Revenue | $145,000 | $435,000 | $870,000 |",
    "",
    "## Margin model",
    "| Metric | Base case |",
    "| --- | ---: |",
    "| Gross margin | 48% |",
    "| Tooling | $42,000 |",
  ].join("\n");

  it("extracts multiple Markdown tables with section identity", () => {
    const tables = extractMarkdownTables(markdown);
    expect(tables).toHaveLength(2);
    expect(tables[0].section).toBe("Revenue and units");
    expect(tables[0].rows[0]).toEqual(["Metric", "Year 1", "Year 2", "Year 3"]);
    expect(tables[1].section).toBe("Margin model");
  });

  it("produces spreadsheet-friendly CSV while preserving estimate caveats", () => {
    const csv = financialModelMarkdownToCsv(markdown, "RiseJar");
    expect(csv).toContain("InventSmith Financial Model,RiseJar");
    expect(csv).toContain('Units,"5,000","15,000","30,000"');
    expect(csv).toContain("Section,Margin model");
    expect(csv).toContain("Estimates and assumptions remain estimates");
    expect(csvDataUrl(csv)).toMatch(/^data:text\/csv;charset=utf-8,/);
  });

  it("exposes financial_model through the normal artifact-download service", () => {
    const source = readFileSync(join(process.cwd(), "convex/deliverableDownloads.ts"), "utf8");
    expect(source).toContain('item.kind === "financial_model"');
    expect(source).toContain('mediaType: "text/csv"');
    expect(source).toContain("financialModelMarkdownToCsv");
  });
});
