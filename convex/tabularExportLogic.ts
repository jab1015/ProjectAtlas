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
