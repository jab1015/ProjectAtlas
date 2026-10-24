import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  csvDataUrl,
  competitorResearchMarkdownToSpreadsheetXml,
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

  it("exports competitor locations and prices into a structured workbook", () => {
    const competitorMarkdown = [
      "## Competitor inventory",
      "| Company | Product | Category | Physical store / retailer | Online location / marketplace | Price | Currency | Price basis | Product URL | Source URL | Research date | Notes |",
      "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
      "| Acme | Rise Cup | Jar | Target | Acme.com; Amazon | 12.99 | USD | each | https://acme.example/product | https://acme.example | 2026-10-22 | Observed listing |",
    ].join("\n");
    const workbook = competitorResearchMarkdownToSpreadsheetXml(competitorMarkdown, "RiseJar");
    expect(workbook).toContain('ss:Name="Competitors"');
    expect(workbook).toContain("Physical store / retailer");
    expect(workbook).toContain("Online location / marketplace");
    expect(workbook).toContain("COMPETITIVE PRODUCT CATEGORY");
    expect(workbook).toContain("SPECIALTY BRICK &amp; MORTAR STORES");
    expect(workbook).toContain('ss:Name="Research details"');
    expect(workbook).toContain('ss:Name="Research images"');
    expect(workbook).toContain("12.99");
    expect(workbook).toContain("https://acme.example/product");
    expect(workbook).toContain('ss:Name="Sources"');
    expect(workbook).toContain('ss:Name="Research report"');
  });

  it("populates the competitor worksheet from narrative research when no Markdown table exists", () => {
    const narrative = [
      "## Commercial alternatives already on shelf",
      "- Target lists **Jif Squeeze Creamy Peanut Butter** at **$3.69**. https://www.target.com/s/squeeze%2Bpeanut%2Bbutter",
      "- Target lists **Skippy Regular Creamy Squeeze Pouch** at **$2.69**. https://www.target.com/s/squeeze%2Bpeanut%2Bbutter",
      "- A patent record US8079499B2 describes a dispensing jar for viscous food product. https://patents.google.com/patent/US8079499B2/en",
    ].join("\n");
    const workbook = competitorResearchMarkdownToSpreadsheetXml(narrative, "RiseJar");
    expect(workbook).toContain("Jif Squeeze Creamy Peanut Butter");
    expect(workbook).toContain("Skippy Regular Creamy Squeeze Pouch");
    expect(workbook).toContain("3.69");
    expect(workbook).toContain("US8079499B2");
    expect(workbook).toContain("Prior-art patent");
    expect(workbook).toContain("COMPETITIVE PRODUCT CATEGORY");
    expect(workbook).toContain("SPECIALTY BIG BOX RETAILERS");
    expect(workbook).toContain('ss:Name="Research details"');
    expect(workbook).toContain('ss:Name="Research images"');
    expect(workbook).not.toContain("No structured competitor records were identified");
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

  it("uses an Excel XML-compatible extension for competitor research", () => {
    const source = readFileSync(join(process.cwd(), "convex/deliverableDownloads.ts"), "utf8");
    expect(source).toContain("competitive research.xls");
    expect(source).not.toContain("competitive research.xlsx");
  });
});
