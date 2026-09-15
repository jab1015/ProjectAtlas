export const NATIVE_CAD_RELEASE_KINDS = [
  "native_cad_step",
  "native_cad_stl",
  "native_cad_dxf",
  "native_cad_source",
  "cad_orthographic_views",
  "cad_exploded_view",
] as const;

export type ManufacturingReleaseCadArtifact<TId = string> = {
  _id: TId;
  kind: string;
  version: number;
  artifactMaturity?: string;
  staleReason?: string;
};

export function selectCurrentSynchronizedCadGeneration<T extends ManufacturingReleaseCadArtifact>(
  artifacts: T[],
): T[] | null {
  const latestByKind: T[] = [];

  for (const kind of NATIVE_CAD_RELEASE_KINDS) {
    const matching = artifacts.filter((artifact) => artifact.kind === kind);
    if (matching.length === 0) return null;

    const latestVersion = Math.max(...matching.map((artifact) => artifact.version));
    const latest = matching.filter((artifact) => artifact.version === latestVersion);
    if (latest.length !== 1) return null;
    latestByKind.push(latest[0]);
  }

  const versions = new Set(latestByKind.map((artifact) => artifact.version));
  if (versions.size !== 1) return null;

  return latestByKind;
}
