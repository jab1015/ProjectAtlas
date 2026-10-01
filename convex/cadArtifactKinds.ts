export const NATIVE_CAD_DELIVERABLE_KINDS = [
  "native_cad_step",
  "native_cad_stl",
  "native_cad_dxf",
  "native_cad_source",
  "cad_orthographic_views",
  "cad_exploded_view",
] as const;

export type NativeCadDeliverableKind = typeof NATIVE_CAD_DELIVERABLE_KINDS[number];

const NATIVE_CAD_DELIVERABLE_KIND_SET = new Set<string>(NATIVE_CAD_DELIVERABLE_KINDS);

export function isNativeCadDeliverableKind(kind: string): kind is NativeCadDeliverableKind {
  return NATIVE_CAD_DELIVERABLE_KIND_SET.has(kind);
}
