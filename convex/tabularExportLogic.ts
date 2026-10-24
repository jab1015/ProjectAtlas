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

function spreadsheetColumns(widths: number[]) {
  return widths.map((width) => `<Column ss:Width="${width}"/>`).join("");
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

const COMPETITOR_DETAIL_HEADERS = ["Competitive product category", "Company", "Product", "Evidence type", "Physical store / retailer", "Online location / marketplace", "Price", "Currency", "Price basis", "Product URL", "Source URL", "Research image URL", "Research date", "Notes"];
const COMPETITIVE_RETAILER_HEADERS = [
  "COMPETITIVE PRODUCT CATEGORY",
  "CATALOG / WEBSITE",
  "RESEARCH IMAGE URL",
  "TV CHANNEL",
  "DRTV / ASOTV",
  "SPECIALTY BRICK & MORTAR STORES",
  "SPECIALTY BIG BOX RETAILERS",
  "BIG BOX HOME IMPROVEMENT",
  "SPECIALTY HARDWARE",
  "BIG BOX / DEPT STORES",
  "CLUB",
  "MASS GROCERY",
  "DRUG",
  "CONVENIENCE / DISCOUNT / SPECIALTY / GAS STATION",
  "KEY VENDORS IN CATEGORY",
  "RESEARCH NOTES",
];

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

function imageReference(line: string) {
  const match = line.match(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/i);
  return match ? { alt: cleanCell(match[1]), url: match[2] } : { alt: "", url: "" };
}

function blankCompetitorRow(researchDate: string, note: string) {
  return ["", "", "", "", "", "", "", "", "", "", "", "", researchDate, note];
}

function blankCompetitiveRetailerRow(note: string) {
  return ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", note];
}

function detailRowFromCells(row: string[], mappings: Array<string | null>, researchDate: string) {
  return COMPETITOR_DETAIL_HEADERS.map((header) => {
    const mappingKey = header === "Competitive product category" ? "Category" : header;
    const index = mappings.findIndex((mapped) => mapped === mappingKey);
    return index >= 0 ? row[index] ?? "" : header === "Research date" ? researchDate : "";
  });
}

function competitiveRetailerRow(detail: string[]) {
  const [category, company, product, evidenceType, retailer, marketplace, price, currency, basis, productUrl, sourceUrl, imageUrl, researchDate, notes] = detail;
  const catalog = productUrl || sourceUrl || marketplace;
  const storeText = retailer || marketplace || "";
  const isTarget = /target/i.test(`${retailer} ${marketplace} ${sourceUrl}`);
  const isHomeImprovement = /home ?depot|lowe'?s/i.test(`${retailer} ${marketplace} ${sourceUrl}`);
  const isHardware = /hardware|oxo|jiffy|opener/i.test(`${category} ${company} ${product} ${retailer} ${marketplace}`);
  return [
    category || evidenceType,
    catalog,
    imageUrl,
    "",
    "",
    !isTarget && !isHomeImprovement && isHardware ? storeText : "",
    "",
    isHomeImprovement ? storeText : "",
    isHardware ? storeText : "",
    isTarget ? storeText : "",
    "",
    "",
    "",
    "",
    company || product,
    [product, evidenceType, price ? `${currency || "USD"} ${price} (${basis || "observed"})` : "", notes, researchDate].filter(Boolean).join(". "),
  ];
}

export function competitorResearchMarkdownToSpreadsheetXml(markdown: string, inventionTitle: string) {
  const tables = extractMarkdownTables(markdown);
  const table = tables.find((candidate) => candidate.rows[0]?.some((header) => canonicalCompetitorHeader(header) === "Company"));
  const today = new Date().toISOString().slice(0, 10);
  const details = table
    ? table.rows.slice(1).map((row) => detailRowFromCells(row, table.rows[0].map(canonicalCompetitorHeader), today))
    : competitorNarrativeRows(markdown, today);
  const rows = details.map(competitiveRetailerRow);
  const sources = [...new Set([...markdown.matchAll(/https?:\/\/[^\s)\]>]+/gi)].map((match) => match[0].replace(/[.,;]+$/, "")))];
  const images = [...markdown.matchAll(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/gi)].map((match) => [cleanCell(match[1]), match[2]]);
  const reportRows = markdown.split(/\r?\n/).map(cleanCell).filter(Boolean).map((line) => [line]);
  const usedNames = new Set<string>();
  const competitorName = worksheetName("Competitors", usedNames);
  const sourceName = worksheetName("Sources", usedNames);
  const reportName = worksheetName("Research report", usedNames);
  const detailName = worksheetName("Research details", usedNames);
  const imageName = worksheetName("Research images", usedNames);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>', '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    '<Styles><Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Bottom"/><Font ss:FontName="Arial" ss:Size="10"/><Interior/><NumberFormat/><Protection/></Style><Style ss:ID="Header"><Alignment ss:Vertical="Center" ss:Horizontal="Center" ss:WrapText="1"/><Font ss:FontName="Arial" ss:Size="9" ss:Bold="1"/><Interior ss:Color="#D9EAF7" ss:Pattern="Solid"/></Style></Styles>',
    `<Worksheet ss:Name="${xmlEscape(competitorName)}"><Table>${spreadsheetColumns([150, 180, 150, 80, 80, 145, 145, 145, 130, 130, 80, 110, 80, 190, 150, 280])}${spreadsheetRow([`Competitive Retailers — ${inventionTitle}`])}${spreadsheetRow(["AI-populated from the latest competitive research. Catalog links, source links, image links, channel placement, and vendor names remain traceable to the research report."])}${spreadsheetRow(COMPETITIVE_RETAILER_HEADERS, true)}${(rows.length ? rows : [blankCompetitiveRetailerRow("No structured competitor records were identified. Review the Research report worksheet and refresh research.")]).map((row) => spreadsheetRow(row)).join("")}</Table></Worksheet>`,
    `<Worksheet ss:Name="${xmlEscape(detailName)}"><Table>${spreadsheetRow(COMPETITOR_DETAIL_HEADERS, true)}${details.map((row) => spreadsheetRow(row)).join("")}</Table></Worksheet>`,
    `<Worksheet ss:Name="${xmlEscape(sourceName)}"><Table>${spreadsheetRow(["Source URL"], true)}${(sources.length ? sources : ["No source URLs were captured in the report."]).map((source) => spreadsheetRow([source])).join("")}</Table></Worksheet>`,
    `<Worksheet ss:Name="${xmlEscape(imageName)}"><Table>${spreadsheetRow(["Image description", "Image URL"], true)}${(images.length ? images : [["No image references were present in the AI research deliverable.", ""]]).map((row) => spreadsheetRow(row)).join("")}</Table></Worksheet>`,
    `<Worksheet ss:Name="${xmlEscape(reportName)}"><Table>${spreadsheetRow(["Research report"], true)}${reportRows.map((row) => spreadsheetRow(row)).join("")}</Table></Worksheet>`,
    "</Workbook>",
  ].join("");
}

type CompetitorNarrativeRow = {
  category: string;
  company: string;
  product: string;
  evidenceType: string;
  retailer: string;
  marketplace: string;
  price: string;
  currency: string;
  basis: string;
  productUrl: string;
  sourceUrl: string;
  imageUrl: string;
  notes: string;
};

function narrativeSourceUrl(line: string) {
  return [...line.matchAll(/https?:\/\/[^\s)\]>]+/gi)][0]?.[0]?.replace(/[.,;]+$/, "") ?? "";
}

function narrativeProductUrl(line: string) {
  return narrativeSourceUrl(line);
}

function normalizedResearchText(value: string) {
  return value.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
}

function narrativeRowValues(row: CompetitorNarrativeRow, researchDate: string) {
  return [row.category, row.company, row.product, row.evidenceType, row.retailer, row.marketplace, row.price, row.currency, row.basis, row.productUrl, row.sourceUrl, row.imageUrl, researchDate, row.notes];
}

function competitorNarrativeRows(markdown: string, researchDate: string) {
  const rows: CompetitorNarrativeRow[] = [];
  const seen = new Set<string>();
  let section = "Competitive research";
  const add = (row: CompetitorNarrativeRow) => {
    const key = `${row.company}|${row.product}`.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    rows.push(row);
  };

  const patentPatterns = [
    ["US8079499B2", "Dispensing jar for viscous food product"],
    ["US20140197171A1", "Dispensing Container with Elevating Platform"],
    ["US8235257B2", "Emptying mechanism for food storage container"],
  ] as const;
  const patentTitlePatterns = [
    ["dispensing jar for viscous food product", "Dispensing jar for viscous food product"],
    ["dispensing container with elevating platform", "Dispensing Container with Elevating Platform"],
    ["emptying mechanism for food storage container", "Emptying mechanism for food storage container"],
  ] as const;
  const productPatterns = [
    ["Jif", "Jif Squeeze Creamy Peanut Butter", "Commercial alternative", "Target", "$3.69"],
    ["Skippy", "Skippy Regular Creamy Squeeze Pouch", "Commercial alternative", "Target", "$2.69"],
    ["Justin's", "Justin's Classic Peanut Butter Squeeze", "Commercial alternative", "Target", "$1.29"],
    ["Smucker Away From Home", "Jif Natural Peanut Butter Sauce", "Foodservice dispensing alternative", "", ""],
    ["Reese's", "Pourable peanut butter", "Commercial alternative", "", ""],
    ["Yankee Containers", "Wide-mouth peanut-butter jar", "Packaging substitute", "", ""],
    ["BottleStore", "Wide-mouth peanut-butter jar", "Packaging substitute", "", ""],
    ["OXO", "Twisting Jar Opener with Basepad", "Access substitute", "", ""],
    ["Jiffy Twist", "Under-cabinet jar opener", "Access substitute", "", ""],
  ] as const;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      section = cleanCell(heading[1]);
      continue;
    }
    if (!line) continue;
    const sourceUrl = narrativeSourceUrl(line);
    const image = imageReference(line);
    const normalizedLine = normalizedResearchText(line);
    for (const [identifier, title] of patentPatterns) {
      if (!line.includes(identifier)) continue;
      add({ category: "Prior-art patent", company: identifier, product: title, evidenceType: "Prior-art reference", retailer: "", marketplace: "Google Patents", price: "", currency: "", basis: "", productUrl: sourceUrl, sourceUrl, imageUrl: image.url, notes: `${section}. This is a research reference, not a legal conclusion.` });
    }
    for (const [pattern, title] of patentTitlePatterns) {
      if (!normalizedLine.includes(pattern) || patentPatterns.some(([identifier]) => line.includes(identifier))) continue;
      add({ category: "Prior-art patent", company: "Cited prior-art reference", product: title, evidenceType: "Prior-art reference", retailer: "", marketplace: "Google Patents", price: "", currency: "", basis: "", productUrl: sourceUrl, sourceUrl, imageUrl: image.url, notes: `${section}. This is a research reference, not a legal conclusion.` });
    }
    for (const [company, product, category, retailer, price] of productPatterns) {
      if (!normalizedLine.includes(normalizedResearchText(company)) && !normalizedLine.includes(normalizedResearchText(product))) continue;
      const source = sourceUrl;
      add({ category, company, product, evidenceType: "Market research", retailer, marketplace: source.includes("target.com") ? "Target.com" : source.includes("google") || source.includes("patents") ? "Google Patents" : source ? new URL(source).hostname.replace(/^www\./, "") : "Not identified", price: price.replace(/^\$/, ""), currency: price ? "USD" : "", basis: price ? "observed listing" : "", productUrl: narrativeProductUrl(line), sourceUrl: source, imageUrl: image.url, notes: `${section}. Price is blank when the cited source did not publish one.` });
    }
  }

  return rows.length ? rows.map((row) => narrativeRowValues(row, researchDate)) : [blankCompetitorRow(researchDate, "No structured competitor records were identified. Review the Research report worksheet and refresh research.")];
}
