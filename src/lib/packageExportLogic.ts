export function buildAtlasPackageFilename(title: string, extension: "docx" | "pdf") {
  const stem = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "invention";
  return `${stem}-inventsmith-feasibility-package.${extension}`;
}

export function selectLatestDeliverables<T extends { kind: string; version: number }>(deliverables: T[]): T[] {
  return selectLatestDeliverablesWithAmbiguity(deliverables).deliverables;
}

export function selectLatestDeliverablesWithAmbiguity<T extends { kind: string; version: number }>(
  deliverables: T[],
): { deliverables: T[]; ambiguousKinds: string[] } {
  const latest = new Map<string, T>();
  const ambiguousKinds: string[] = [];
  for (const kind of new Set(deliverables.map((deliverable) => deliverable.kind))) {
    const matching = deliverables.filter((deliverable) => deliverable.kind === kind);
    const highestVersion = Math.max(...matching.map((deliverable) => deliverable.version));
    const newest = matching.filter((deliverable) => deliverable.version === highestVersion);
    if (newest.length !== 1) {
      ambiguousKinds.push(kind);
      continue;
    }
    latest.set(kind, newest[0]);
  }
  return { deliverables: [...latest.values()], ambiguousKinds: ambiguousKinds.sort() };
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

export interface PackageExportSafetyDeliverable {
  title: string;
  trustState: string;
  staleReason?: string;
  content?: string;
}

/**
 * Package export is a consequential external-use boundary, not merely a file
 * formatter. Fail closed if the newest artifact for any included kind is stale
 * or has not reached explicit authorized-use trust state. Draft/review artifacts
 * remain readable and individually downloadable inside InventSmith.
 */
export function validatePackageExportSafety(
  deliverables: PackageExportSafetyDeliverable[],
  qualityPassed: boolean,
  qualityBlockers: string[] = [],
): string | null {
  if (!deliverables.length) return "Package has no deliverables to export.";
  if (!qualityPassed) {
    return qualityBlockers.length
      ? `Package quality checks have not passed: ${qualityBlockers.join("; ")}`
      : "Package quality checks have not passed.";
  }

  const empty = deliverables.filter((deliverable) =>
    !deliverable.title.trim() || (deliverable.content !== undefined && !deliverable.content.trim())
  );
  if (empty.length) {
    return `Package contains ${empty.length} deliverable(s) with missing title or readable content.`;
  }

  const stale = deliverables.filter((deliverable) => Boolean(deliverable.staleReason));
  if (stale.length) {
    return `Package contains ${stale.length} stale deliverable(s). Refresh them before external export.`;
  }

  const unauthorized = deliverables.filter((deliverable) => deliverable.trustState !== "ready_for_authorized_use");
  if (unauthorized.length) {
    return `Package contains ${unauthorized.length} deliverable(s) that are not ready for authorized external use.`;
  }
  return null;
}
