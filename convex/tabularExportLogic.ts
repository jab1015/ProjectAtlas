function cleanCell(value: string) {
  return value
    .trim()
    .replace(/^\*\*(.*?)\*\*$/g, "$1")
    .replace(/^`(.*?)`$/g, "$1")
    .replace(/<br\s*\/?>/gi, " ")
    .trim();
}

function csvCell(value: string) {
  const normalized = value.replace(/\r?\n/g, " ").trim();
  return /[",\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

function splitMarkdownRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map(cleanCell);
}

function isSeparatorRow(cells: string[]) {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
}

export interface MarkdownTable {
  section: string;
  rows: string[][];
}

export function extractMarkdownTables(markdown: string): MarkdownTable[] {
  const lines = markdown.split(/\r?\n/);
  const tables: MarkdownTable[] = [];
  let section = "Financial Model";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      section = cleanCell(heading[1]);
      continue;
    }
    if (!line.startsWith("|") || !lines[index + 1]?.trim().startsWith("|")) continue;
    const header = splitMarkdownRow(line);
    const separator = splitMarkdownRow(lines[index + 1]);
    if (!isSeparatorRow(separator) || header.length < 2) continue;

    const rows = [header];
    index += 2;
    while (index < lines.length && lines[index].trim().startsWith("|")) {
      const cells = splitMarkdownRow(lines[index]);
      if (!isSeparatorRow(cells)) rows.push(cells);
      index += 1;
    }
    index -= 1;
    tables.push({ section, rows });
  }
  return tables;
}

export function financialModelMarkdownToCsv(markdown: string, inventionTitle: string) {
  const tables = extractMarkdownTables(markdown);
  const output: string[] = [
    ["InventSmith Financial Model", inventionTitle].map(csvCell).join(","),
    ["Generated artifact", "Structured CSV export of evidence-backed financial-model tables"].map(csvCell).join(","),
    ["Important", "Estimates and assumptions remain estimates; use the source deliverable for evidence, limitations, and professional-review context."].map(csvCell).join(","),
    "",
  ];

  if (tables.length === 0) {
    output.push(["Section", "Financial model narrative"].map(csvCell).join(","));
    for (const line of markdown.split(/\r?\n/).map(cleanCell).filter(Boolean)) {
      output.push(["Narrative", line].map(csvCell).join(","));
    }
    return output.join("\r\n");
  }

  tables.forEach((table, tableIndex) => {
    if (tableIndex > 0) output.push("");
    output.push(["Section", table.section].map(csvCell).join(","));
    for (const row of table.rows) output.push(row.map(csvCell).join(","));
  });
  return output.join("\r\n");
}

export function csvDataUrl(csv: string) {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(`\uFEFF${csv}`)}`;
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function worksheetName(value: string, used: Set<string>) {
  const base = value.replace(/[\\/?*\[\]:]/g, " ").replace(/\s+/g, " ").trim().slice(0, 31) || "Financial Model";
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate.toLowerCase())) {
    const tag = ` ${suffix}`;
    candidate = `${base.slice(0, Math.max(1, 31 - tag.length))}${tag}`;
    suffix += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

function spreadsheetCell(value: string, header = false) {
  return `<Cell${header ? ' ss:StyleID="Header"' : ""}><Data ss:Type="String">${xmlEscape(cleanCell(value))}</Data></Cell>`;
}

function spreadsheetRow(values: string[], header = false) {
  return `<Row>${values.map((value) => spreadsheetCell(value, header)).join("")}</Row>`;
}

export function financialModelMarkdownToSpreadsheetXml(markdown: string, inventionTitle: string) {
  const tables = extractMarkdownTables(markdown);
  const usedNames = new Set<string>();
  const worksheets: string[] = [];
  const warning = "Estimates and assumptions remain estimates; use the source deliverable for evidence, limitations, and professional-review context.";

  const summaryName = worksheetName("Summary", usedNames);
  worksheets.push([
    `<Worksheet ss:Name="${xmlEscape(summaryName)}"><Table>`,
    spreadsheetRow(["InventSmith Financial Model", inventionTitle]),
    spreadsheetRow(["Generated artifact", "Excel-readable structured workbook of evidence-backed financial-model tables"]),
    spreadsheetRow(["Important", warning]),
    spreadsheetRow(["Worksheet count", String(Math.max(1, tables.length))]),
    "</Table></Worksheet>",
  ].join(""));

  if (tables.length === 0) {
    const narrativeName = worksheetName("Financial Model", usedNames);
    const narrativeRows = markdown.split(/\r?\n/).map(cleanCell).filter(Boolean);
    worksheets.push(`<Worksheet ss:Name="${xmlEscape(narrativeName)}"><Table>${spreadsheetRow(["Narrative"], true)}${narrativeRows.map((line) => spreadsheetRow([line])).join("")}</Table></Worksheet>`);
  } else {
    for (const table of tables) {
      const name = worksheetName(table.section, usedNames);
      const rows = table.rows.map((row, index) => spreadsheetRow(row, index === 0)).join("");
      worksheets.push(`<Worksheet ss:Name="${xmlEscape(name)}"><Table>${rows}</Table></Worksheet>`);
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    '<Styles><Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Bottom"/><Font/><Interior/><NumberFormat/><Protection/></Style><Style ss:ID="Header"><Font ss:Bold="1"/></Style></Styles>',
    ...worksheets,
    "</Workbook>",
  ].join("");
}

export function spreadsheetXmlDataUrl(xml: string) {
  return `data:application/vnd.ms-excel;charset=utf-8,${encodeURIComponent(`\uFEFF${xml}`)}`;
}

const COMPETITOR_HEADERS = ["Company", "Product", "Category", "Physical store / retailer", "Online location / marketplace", "Price", "Currency", "Price basis", "Product URL", "Source URL", "Research date", "Notes"];

function canonicalCompetitorHeader(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (normalized.includes("company") || normalized.includes("competitor")) return "Company";
  if (normalized.includes("product") || normalized.includes("offering")) return "Product";
  if (normalized.includes("category") || normalized.includes("type")) return "Category";
  if (normalized.includes("physical") || normalized.includes("retailer") || normalized.includes("store")) return "Physical store / retailer";
  if (normalized.includes("online") || normalized.includes("marketplace") || normalized.includes("seller") || normalized.includes("sold from")) return "Online location / marketplace";
  if (normalized.includes("price") || normalized.includes("cost")) return "Price";
  if (normalized.includes("currency")) return "Currency";
  if (normalized.includes("basis") || normalized.includes("unit") || normalized.includes("pack")) return "Price basis";
  if (normalized.includes("product url") || normalized.includes("product link")) return "Product URL";
  if (normalized.includes("source") || normalized.includes("url") || normalized.includes("link")) return "Source URL";
  if (normalized.includes("date") || normalized.includes("checked") || normalized.includes("researched")) return "Research date";
  if (normalized.includes("note") || normalized.includes("observation")) return "Notes";
  return null;
}

export function competitorResearchMarkdownToSpreadsheetXml(markdown: string, inventionTitle: string) {
  const tables = extractMarkdownTables(markdown);
  const table = tables.find((candidate) => candidate.rows[0]?.some((header) => canonicalCompetitorHeader(header) === "Company"));
  const today = new Date().toISOString().slice(0, 10);
  const rows = table ? table.rows.slice(1).map((row) => {
    const mappings = table.rows[0].map(canonicalCompetitorHeader);
    return COMPETITOR_HEADERS.map((header) => {
      const index = mappings.findIndex((mapped) => mapped === header);
      return index >= 0 ? row[index] ?? "" : header === "Research date" ? today : "";
    });
  }) : [["", "", "", "", "", "", "", "", "", "", today, "No structured competitor table was present. Review the report sheet and refresh research."]];
  const sources = [...new Set([...markdown.matchAll(/https?:\/\/[^\s)\]>]+/gi)].map((match) => match[0].replace(/[.,;]+$/, "")))];
  const reportRows = markdown.split(/\r?\n/).map(cleanCell).filter(Boolean).map((line) => [line]);
  const usedNames = new Set<string>();
  const competitorName = worksheetName("Competitors", usedNames);
  const sourceName = worksheetName("Sources", usedNames);
  const reportName = worksheetName("Research report", usedNames);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>', '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    '<Styles><Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Bottom"/><Font/><Interior/><NumberFormat/><Protection/></Style><Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#E8F2EA" ss:Pattern="Solid"/></Style></Styles>',
    `<Worksheet ss:Name="${xmlEscape(competitorName)}"><Table>${spreadsheetRow([`InventSmith Competitive Research — ${inventionTitle}`])}${spreadsheetRow(COMPETITOR_HEADERS, true)}${rows.map((row) => spreadsheetRow(row)).join("")}</Table></Worksheet>`,
    `<Worksheet ss:Name="${xmlEscape(sourceName)}"><Table>${spreadsheetRow(["Source URL"], true)}${(sources.length ? sources : ["No source URLs were captured in the report."]).map((source) => spreadsheetRow([source])).join("")}</Table></Worksheet>`,
    `<Worksheet ss:Name="${xmlEscape(reportName)}"><Table>${spreadsheetRow(["Research report"], true)}${reportRows.map((row) => spreadsheetRow(row)).join("")}</Table></Worksheet>`,
    "</Workbook>",
  ].join("");
}
