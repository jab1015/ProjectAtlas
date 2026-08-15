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
