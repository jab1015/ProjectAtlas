import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  csvDataUrl,
  extractMarkdownTables,
  financialModelMarkdownToCsv,
  financialModelMarkdownToSpreadsheetXml,
  spreadsheetXmlDataUrl,
} from "../../convex/tabularExportLogic";

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

  it("produces an Excel-readable workbook with one worksheet per financial section", () => {
    const workbook = financialModelMarkdownToSpreadsheetXml(markdown, "RiseJar & Co");
    expect(workbook).toContain('<?mso-application progid="Excel.Sheet"?>');
    expect(workbook).toContain('ss:Name="Summary"');
    expect(workbook).toContain('ss:Name="Revenue and units"');
    expect(workbook).toContain('ss:Name="Margin model"');
    expect(workbook).toContain("RiseJar &amp; Co");
    expect(workbook).toContain("Estimates and assumptions remain estimates");
    expect(workbook).toContain('ss:StyleID="Header"');
    expect(spreadsheetXmlDataUrl(workbook)).toMatch(/^data:application\/vnd\.ms-excel;charset=utf-8,/);
  });

  it("keeps worksheet names Excel-safe and unique", () => {
    const repeated = [
      "## Sales/Channel: Plan?",
      "| Metric | Value |",
      "| --- | --- |",
      "| A | 1 |",
      "## Sales/Channel: Plan?",
      "| Metric | Value |",
      "| --- | --- |",
      "| B | 2 |",
    ].join("\n");
    const workbook = financialModelMarkdownToSpreadsheetXml(repeated, "Example");
    expect(workbook).toContain('ss:Name="Sales Channel Plan"');
    expect(workbook).toContain('ss:Name="Sales Channel Plan 2"');
    expect(workbook).not.toContain('ss:Name="Sales/Channel: Plan?"');
  });

  it("exposes both CSV and Excel-readable financial_model downloads through the normal artifact service", () => {
    const source = readFileSync(join(process.cwd(), "convex/deliverableDownloads.ts"), "utf8");
    expect(source).toContain('item.kind === "financial_model"');
    expect(source).toContain('mediaType: "text/csv"');
    expect(source).toContain('mediaType: "application/vnd.ms-excel"');
    expect(source).toContain("financialModelMarkdownToCsv");
    expect(source).toContain("financialModelMarkdownToSpreadsheetXml");
    expect(source).toContain("spreadsheetXmlDataUrl");
    expect(source).toContain("groups.flat()");
  });
});
