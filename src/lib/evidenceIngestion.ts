export interface EvidenceExtraction {
  extractionVersion: 1;
  mode: "csv_survey" | "text" | "metadata_only";
  summary: string;
  textPreview?: string;
  survey?: {
    rowCount: number;
    columnCount: number;
    headers: string[];
    questions: Array<{
      header: string;
      responseCount: number;
      blankCount: number;
      topResponses: Array<{ value: string; count: number }>;
    }>;
  };
  limitations: string[];
}

const MAX_TEXT_PREVIEW = 12_000;
const MAX_SURVEY_ROWS = 2_000;
const MAX_SURVEY_COLUMNS = 80;
const MAX_TOP_RESPONSES = 8;

function normalizeText(value: string): string {
  return value.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").trim();
}

function parseCsvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "," && !quoted) {
      row.push(field.trim());
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field.trim());
      field = "";
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  row.push(field.trim());
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

function summarizeCsv(text: string): EvidenceExtraction {
  const rows = parseCsvRows(text).slice(0, MAX_SURVEY_ROWS + 1);
  const rawHeaders = rows[0] ?? [];
  const headers = rawHeaders
    .slice(0, MAX_SURVEY_COLUMNS)
    .map((header, index) => header.trim() || `Column ${index + 1}`);
  const dataRows = rows.slice(1, MAX_SURVEY_ROWS + 1);

  const questions = headers.map((header, columnIndex) => {
    const values = dataRows.map((row) => (row[columnIndex] ?? "").trim());
    const nonBlank = values.filter(Boolean);
    const counts = new Map<string, number>();
    for (const value of nonBlank) counts.set(value, (counts.get(value) ?? 0) + 1);
    const topResponses = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, MAX_TOP_RESPONSES)
      .map(([value, count]) => ({ value: value.slice(0, 240), count }));

    return {
      header: header.slice(0, 300),
      responseCount: nonBlank.length,
      blankCount: values.length - nonBlank.length,
      topResponses,
    };
  });

  const limitations: string[] = [
    "InventSmith has not independently verified respondent identity, sampling quality, survey methodology, or whether the responses represent the target market.",
  ];
  if (rows.length > MAX_SURVEY_ROWS) limitations.push(`Only the first ${MAX_SURVEY_ROWS} response rows were summarized for ingestion.`);
  if (rawHeaders.length > MAX_SURVEY_COLUMNS) limitations.push(`Only the first ${MAX_SURVEY_COLUMNS} columns were summarized for ingestion.`);

  return {
    extractionVersion: 1,
    mode: "csv_survey",
    summary: `Parsed ${dataRows.length} survey response rows across ${headers.length} columns. Response distributions are available to Validation as inventor-provided evidence.`,
    survey: {
      rowCount: dataRows.length,
      columnCount: headers.length,
      headers,
      questions,
    },
    limitations,
  };
}

export async function extractEvidenceFromFile(file: File, evidenceKind: string): Promise<EvidenceExtraction> {
  const lowerName = file.name.toLowerCase();
  const isCsv = lowerName.endsWith(".csv") || file.type === "text/csv";
  const isText = lowerName.endsWith(".txt") || lowerName.endsWith(".md") || file.type.startsWith("text/");

  if (isCsv) {
    const text = normalizeText(await file.text());
    return summarizeCsv(text);
  }

  if (isText) {
    const text = normalizeText(await file.text());
    const preview = text.slice(0, MAX_TEXT_PREVIEW);
    return {
      extractionVersion: 1,
      mode: "text",
      summary: `Extracted ${preview.length.toLocaleString()} characters of ${evidenceKind.replaceAll("_", " ")} text for downstream evidence review.`,
      textPreview: preview,
      limitations: [
        ...(text.length > MAX_TEXT_PREVIEW ? [`The source was longer than ${MAX_TEXT_PREVIEW.toLocaleString()} characters; only the leading text is included in the structured ingestion preview.`] : []),
        "The text is inventor-provided evidence and remains unverified until InventSmith or a qualified reviewer evaluates its provenance and relevance.",
      ],
    };
  }

  return {
    extractionVersion: 1,
    mode: "metadata_only",
    summary: `Stored ${evidenceKind.replaceAll("_", " ")} evidence for downstream review. Automated content extraction for this file type is not yet available in this ingestion path.`,
    limitations: [
      "The file is preserved, but its binary contents have not yet been converted into structured evidence. InventSmith must not infer that the file supports a claim until its contents are reviewed or extracted.",
    ],
  };
}
