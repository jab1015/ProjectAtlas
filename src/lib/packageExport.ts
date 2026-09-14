import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { buildAtlasPackageFilename, validatePackageExportSafety, validatePackageExportSize } from "./packageExportLogic";
export { buildAtlasPackageFilename, selectLatestDeliverables } from "./packageExportLogic";

export interface ExportSource {
  id: string;
  title: string;
  locator?: string;
  reliability: string;
}

export interface ExportReview {
  specialty: string;
  status: string;
  scope: string;
  reviewerName?: string;
  reviewerReference?: string;
  notes?: string;
}

export interface ExportDeliverable {
  kind: string;
  title: string;
  version: number;
  trustState: string;
  trustLabel: string;
  content: string;
  sourceCoverage?: number;
  confidence?: number;
  searchDate?: number;
  staleReason?: string;
  artifactMaturity?: string;
  assumptions: string[];
  limitations: string[];
  missingInformation: string[];
  sources: ExportSource[];
  reviews: ExportReview[];
}

export interface AtlasPackageExport {
  inventionTitle: string;
  generatedAt: number;
  qualityPassed: boolean;
  qualityBlockers: string[];
  deliverables: ExportDeliverable[];
}

const DISCLAIMER = "InventSmith provides research and drafting assistance only. This package is not a patentability or freedom-to-operate opinion, legal advice, regulatory approval, production-release engineering, or a guarantee of funding or market success. Required professionals must review applicable work before external reliance, filing, manufacture, or sale.";

function validateExport(input: AtlasPackageExport) {
  const sizeError = validatePackageExportSize(input.deliverables);
  if (sizeError) throw new Error(sizeError);
  const safetyError = validatePackageExportSafety(input.deliverables, input.qualityPassed, input.qualityBlockers);
  if (safetyError) throw new Error(safetyError);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function bullet(text: string) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 80, line: 280 } });
}

function labelValue(label: string, value: string) {
  return new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(value)] });
}

function optionalList(title: string, items: string[]) {
  if (!items.length) return [];
  return [new Paragraph({ text: title, heading: HeadingLevel.HEADING_3 }), ...items.map(bullet)];
}

export async function exportAtlasPackageDocx(input: AtlasPackageExport) {
  validateExport(input);
  const children: Array<Paragraph | Table> = [
    new Paragraph({ text: "INVENTSMITH FEASIBILITY & IP-READINESS PACKAGE", heading: HeadingLevel.TITLE, spacing: { after: 120 } }),
    new Paragraph({ text: "The Inventor OS · Published by Modern Methods", spacing: { after: 120 } }),
    new Paragraph({ text: input.inventionTitle, style: "Subtitle", spacing: { after: 280 } }),
    new Table({
      width: { size: 9360, type: WidthType.DXA }, columnWidths: [2880, 6480],
      rows: [
        ["Generated", new Date(input.generatedAt).toLocaleString()],
        ["Automated package checks", "Passed"],
        ["External-use authorization", "All included deliverables explicitly authorized and current"],
        ["Included deliverables", String(input.deliverables.length)],
      ].map(([label, value]) => new TableRow({ children: [
        new TableCell({ width: { size: 2880, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: "F2F4F7" }, children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })] }),
        new TableCell({ width: { size: 6480, type: WidthType.DXA }, children: [new Paragraph(value)] }),
      ] })),
    }),
    new Paragraph({ text: "Important limitations", heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: DISCLAIMER, shading: { type: ShadingType.CLEAR, fill: "FFF8E8" }, spacing: { after: 200 } }),
  ];

  for (const deliverable of input.deliverables) {
    children.push(
      new Paragraph({ text: deliverable.title, heading: HeadingLevel.HEADING_1, pageBreakBefore: true }),
      labelValue("Artifact", deliverable.kind.replaceAll("_", " ")),
      labelValue("Version", String(deliverable.version)),
      labelValue("Trust state", deliverable.trustLabel),
      labelValue("Artifact maturity", deliverable.artifactMaturity?.replaceAll("_", " ") ?? "Not recorded"),
      labelValue("External use", "Authorized and current"),
      labelValue("Evidence coverage", deliverable.sourceCoverage === undefined ? "Not measured" : `${Math.round(deliverable.sourceCoverage * 100)}%`),
      labelValue("Confidence", deliverable.confidence === undefined ? "Not measured" : `${Math.round(deliverable.confidence * 100)}%`),
      labelValue("Research date", deliverable.searchDate ? new Date(deliverable.searchDate).toLocaleDateString() : "Not recorded"),
      new Paragraph({ text: "Content", heading: HeadingLevel.HEADING_2 }),
    );
    for (const block of deliverable.content.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean)) children.push(new Paragraph({ text: block, spacing: { after: 120, line: 264 } }));
    children.push(...optionalList("Assumptions", deliverable.assumptions));
    children.push(...optionalList("Limitations", deliverable.limitations));
    children.push(...optionalList("Missing information", deliverable.missingInformation));
    if (deliverable.sources.length) {
      children.push(new Paragraph({ text: "Evidence sources", heading: HeadingLevel.HEADING_2 }));
      children.push(...deliverable.sources.map((source) => bullet(`${source.title}${source.locator ? ` - ${source.locator}` : ""} (${source.reliability.replaceAll("_", " ")})`)));
    }
    if (deliverable.reviews.length) {
      children.push(new Paragraph({ text: "Professional review record", heading: HeadingLevel.HEADING_2 }));
      for (const review of deliverable.reviews) {
        children.push(labelValue(review.specialty.replaceAll("_", " "), `${review.status.replaceAll("_", " ")}${review.reviewerName ? ` - ${review.reviewerName}` : ""}`));
        children.push(new Paragraph({ text: review.scope, spacing: { after: 80 } }));
        if (review.notes) children.push(new Paragraph({ text: `Reviewer notes: ${review.notes}`, spacing: { after: 80 } }));
      }
    }
  }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Calibri", size: 22 }, paragraph: { spacing: { after: 120, line: 264 } } } },
      paragraphStyles: [
        { id: "Title", name: "Title", basedOn: "Normal", run: { size: 46, bold: true, color: "0B2545" }, paragraph: { spacing: { before: 0, after: 120 } } },
        { id: "Subtitle", name: "Subtitle", basedOn: "Normal", run: { size: 28, color: "555555" }, paragraph: { spacing: { before: 0, after: 280 } } },
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, color: "2E74B5" }, paragraph: { spacing: { before: 320, after: 160 }, keepNext: true } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, color: "2E74B5" }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, color: "1F4D78" }, paragraph: { spacing: { before: 160, after: 80 }, keepNext: true } },
      ],
    },
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 708, footer: 708 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("InventSmith package | Page "), new TextRun({ children: [PageNumber.CURRENT] })] })] }) },
      children,
    }],
  });
  downloadBlob(await Packer.toBlob(doc), buildAtlasPackageFilename(input.inventionTitle, "docx"));
}

function wrapPdfText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
    else { if (line) lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export async function exportAtlasPackagePdf(input: AtlasPackageExport) {
  validateExport(input);
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const margin = 54, width = 612, height = 792;
  let page: PDFPage, y: number;
  const newPage = () => { page = pdf.addPage([width, height]); y = height - margin; };
  const addText = (text: string, options: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; gap?: number } = {}) => {
    const size = options.size ?? 10, font = options.font ?? regular;
    for (const line of wrapPdfText(text, font, size, width - margin * 2)) {
      if (y < margin + size * 2) newPage();
      page.drawText(line, { x: margin, y, size, font, color: options.color ?? rgb(0.12, 0.15, 0.18) });
      y -= size * 1.35;
    }
    y -= options.gap ?? 5;
  };
  newPage();
  addText("INVENTSMITH FEASIBILITY & IP-READINESS PACKAGE", { size: 18, font: bold, color: rgb(0.04, 0.15, 0.27), gap: 8 });
  addText("The Inventor OS | Published by Modern Methods", { size: 10, font: bold, gap: 8 });
  addText(input.inventionTitle, { size: 15, font: bold, gap: 18 });
  addText(`Generated: ${new Date(input.generatedAt).toLocaleString()}`);
  addText("Automated package checks: Passed", { font: bold });
  addText("External-use authorization: All included deliverables explicitly authorized and current", { font: bold, gap: 12 });
  addText("IMPORTANT LIMITATIONS", { size: 13, font: bold, color: rgb(0.48, 0.35, 0), gap: 4 });
  addText(DISCLAIMER, { gap: 14 });
  for (const deliverable of input.deliverables) {
    newPage();
    addText(deliverable.title, { size: 16, font: bold, color: rgb(0.18, 0.45, 0.71), gap: 8 });
    addText(`${deliverable.kind.replaceAll("_", " ")} | Version ${deliverable.version} | ${deliverable.trustLabel}`, { font: bold });
    addText(`Artifact maturity: ${deliverable.artifactMaturity?.replaceAll("_", " ") ?? "Not recorded"} | External use: Authorized and current`);
    addText(`Evidence coverage: ${deliverable.sourceCoverage === undefined ? "Not measured" : `${Math.round(deliverable.sourceCoverage * 100)}%`} | Confidence: ${deliverable.confidence === undefined ? "Not measured" : `${Math.round(deliverable.confidence * 100)}%`}`);
    addText("CONTENT", { size: 12, font: bold, gap: 4 });
    deliverable.content.split(/\n{2,}/).filter(Boolean).forEach((block) => addText(block));
    const addList = (title: string, items: string[]) => { if (!items.length) return; addText(title.toUpperCase(), { size: 11, font: bold }); items.forEach((item) => addText(`- ${item}`)); };
    addList("Assumptions", deliverable.assumptions);
    addList("Limitations", deliverable.limitations);
    addList("Missing information", deliverable.missingInformation);
    addList("Evidence sources", deliverable.sources.map((source) => `${source.title}${source.locator ? ` - ${source.locator}` : ""} (${source.reliability.replaceAll("_", " ")})`));
    if (deliverable.reviews.length) {
      addText("PROFESSIONAL REVIEW RECORD", { size: 11, font: bold });
      deliverable.reviews.forEach((review) => addText(`${review.specialty.replaceAll("_", " ")}: ${review.status.replaceAll("_", " ")}${review.reviewerName ? ` - ${review.reviewerName}` : ""}. ${review.scope}${review.notes ? ` Notes: ${review.notes}` : ""}`));
    }
  }
  const pages = pdf.getPages();
  pages.forEach((pdfPage, index) => pdfPage.drawText(`InventSmith package | Page ${index + 1} of ${pages.length}`, { x: width - margin - 145, y: 28, size: 8, font: regular, color: rgb(0.4, 0.4, 0.4) }));
  const bytes = await pdf.save();
  downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), buildAtlasPackageFilename(input.inventionTitle, "pdf"));
}
