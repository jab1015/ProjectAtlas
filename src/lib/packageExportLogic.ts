export function buildAtlasPackageFilename(title: string, extension: "docx" | "pdf") {
  const stem = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "invention";
  return `${stem}-inventsmith-feasibility-package.${extension}`;
}

export function selectLatestDeliverables<T extends { kind: string; version: number }>(deliverables: T[]): T[] {
  const latest = new Map<string, T>();
  for (const deliverable of deliverables) {
    const prior = latest.get(deliverable.kind);
    if (!prior || deliverable.version > prior.version) latest.set(deliverable.kind, deliverable);
  }
  return [...latest.values()];
}

export const MAX_PACKAGE_EXPORT_DELIVERABLES = 50;
export const MAX_PACKAGE_EXPORT_CHARACTERS = 1_000_000;

export function validatePackageExportSize(deliverables: Array<{ content: string }>): string | null {
  if (deliverables.length > MAX_PACKAGE_EXPORT_DELIVERABLES) {
    return `Package has more than ${MAX_PACKAGE_EXPORT_DELIVERABLES} deliverables.`;
  }
  const characters = deliverables.reduce((total, deliverable) => total + deliverable.content.length, 0);
  if (characters > MAX_PACKAGE_EXPORT_CHARACTERS) {
    return "Package content is too large to export safely in the browser.";
  }
  return null;
}
