export type Vec3 = [number, number, number];

export type CadPrimitive =
  | { type: "box"; size: Vec3 }
  | { type: "cylinder"; radius: number; height: number; segments?: number }
  | { type: "tube"; outerRadius: number; innerRadius: number; height: number; segments?: number };

export interface CadPartSpec {
  id: string;
  name: string;
  primitive: CadPrimitive;
  position?: Vec3;
  rotationDeg?: Vec3;
  material?: string;
}

export interface CadAssemblySpec {
  name: string;
  units: "mm";
  revision: string;
  parts: CadPartSpec[];
  assumptions: string[];
  unresolvedEngineering: string[];
}

export interface Triangle {
  a: Vec3;
  b: Vec3;
  c: Vec3;
  partId: string;
  partName: string;
}

export interface CadArtifactBundle {
  stl: string;
  dxf: string;
  step: string;
  sourceJson: string;
  triangleCount: number;
  partCount: number;
}

const EPSILON = 1e-9;

function finitePositive(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be a finite positive number`);
  return value;
}

function segments(value?: number): number {
  const normalized = Math.round(value ?? 48);
  return Math.max(12, Math.min(128, normalized));
}

function radians(value: number): number {
  return value * Math.PI / 180;
}

function rotatePoint(point: Vec3, rotation: Vec3): Vec3 {
  let [x, y, z] = point;
  const [rx, ry, rz] = rotation.map(radians) as Vec3;

  const cosy = Math.cos(rx); const siny = Math.sin(rx);
  [y, z] = [y * cosy - z * siny, y * siny + z * cosy];

  const cosx = Math.cos(ry); const sinx = Math.sin(ry);
  [x, z] = [x * cosx + z * sinx, -x * sinx + z * cosx];

  const cosz = Math.cos(rz); const sinz = Math.sin(rz);
  [x, y] = [x * cosz - y * sinz, x * sinz + y * cosz];
  return [x, y, z];
}

function transform(point: Vec3, part: CadPartSpec): Vec3 {
  const rotated = rotatePoint(point, part.rotationDeg ?? [0, 0, 0]);
  const position = part.position ?? [0, 0, 0];
  return [rotated[0] + position[0], rotated[1] + position[1], rotated[2] + position[2]];
}

function triangle(part: CadPartSpec, a: Vec3, b: Vec3, c: Vec3): Triangle {
  return { a: transform(a, part), b: transform(b, part), c: transform(c, part), partId: part.id, partName: part.name };
}

function boxTriangles(part: CadPartSpec, size: Vec3): Triangle[] {
  const [sx, sy, sz] = size.map((value, index) => finitePositive(value, `box size ${index + 1}`)) as Vec3;
  const x = sx / 2; const y = sy / 2; const z = sz / 2;
  const p: Vec3[] = [
    [-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z],
    [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z],
  ];
  const faces = [
    [0, 2, 1], [0, 3, 2],
    [4, 5, 6], [4, 6, 7],
    [0, 1, 5], [0, 5, 4],
    [1, 2, 6], [1, 6, 5],
    [2, 3, 7], [2, 7, 6],
    [3, 0, 4], [3, 4, 7],
  ];
  return faces.map(([a, b, c]) => triangle(part, p[a], p[b], p[c]));
}

function cylinderTriangles(part: CadPartSpec, radiusValue: number, heightValue: number, segmentValue?: number): Triangle[] {
  const radius = finitePositive(radiusValue, "cylinder radius");
  const height = finitePositive(heightValue, "cylinder height");
  const count = segments(segmentValue);
  const bottomZ = -height / 2;
  const topZ = height / 2;
  const out: Triangle[] = [];

  for (let i = 0; i < count; i += 1) {
    const a0 = 2 * Math.PI * i / count;
    const a1 = 2 * Math.PI * (i + 1) / count;
    const b0: Vec3 = [radius * Math.cos(a0), radius * Math.sin(a0), bottomZ];
    const b1: Vec3 = [radius * Math.cos(a1), radius * Math.sin(a1), bottomZ];
    const t0: Vec3 = [b0[0], b0[1], topZ];
    const t1: Vec3 = [b1[0], b1[1], topZ];
    out.push(triangle(part, b0, b1, t1), triangle(part, b0, t1, t0));
    out.push(triangle(part, [0, 0, bottomZ], b1, b0));
    out.push(triangle(part, [0, 0, topZ], t0, t1));
  }
  return out;
}

function tubeTriangles(part: CadPartSpec, outerValue: number, innerValue: number, heightValue: number, segmentValue?: number): Triangle[] {
  const outer = finitePositive(outerValue, "tube outer radius");
  const inner = finitePositive(innerValue, "tube inner radius");
  if (inner >= outer) throw new Error("tube inner radius must be smaller than outer radius");
  const height = finitePositive(heightValue, "tube height");
  const count = segments(segmentValue);
  const z0 = -height / 2; const z1 = height / 2;
  const out: Triangle[] = [];

  for (let i = 0; i < count; i += 1) {
    const a0 = 2 * Math.PI * i / count;
    const a1 = 2 * Math.PI * (i + 1) / count;
    const ob0: Vec3 = [outer * Math.cos(a0), outer * Math.sin(a0), z0];
    const ob1: Vec3 = [outer * Math.cos(a1), outer * Math.sin(a1), z0];
    const ot0: Vec3 = [ob0[0], ob0[1], z1];
    const ot1: Vec3 = [ob1[0], ob1[1], z1];
    const ib0: Vec3 = [inner * Math.cos(a0), inner * Math.sin(a0), z0];
    const ib1: Vec3 = [inner * Math.cos(a1), inner * Math.sin(a1), z0];
    const it0: Vec3 = [ib0[0], ib0[1], z1];
    const it1: Vec3 = [ib1[0], ib1[1], z1];

    out.push(triangle(part, ob0, ob1, ot1), triangle(part, ob0, ot1, ot0));
    out.push(triangle(part, ib0, it1, ib1), triangle(part, ib0, it0, it1));
    out.push(triangle(part, ot0, ot1, it1), triangle(part, ot0, it1, it0));
    out.push(triangle(part, ob0, ib1, ob1), triangle(part, ob0, ib0, ib1));
  }
  return out;
}

export function buildCadMesh(spec: CadAssemblySpec): Triangle[] {
  if (spec.units !== "mm") throw new Error("InventSmith CAD currently requires millimeter units");
  if (!spec.parts.length) throw new Error("CAD assembly must contain at least one part");
  const ids = new Set<string>();
  const triangles: Triangle[] = [];

  for (const part of spec.parts) {
    if (!part.id.trim() || ids.has(part.id)) throw new Error("Every CAD part must have a unique non-empty id");
    ids.add(part.id);
    switch (part.primitive.type) {
      case "box": triangles.push(...boxTriangles(part, part.primitive.size)); break;
      case "cylinder": triangles.push(...cylinderTriangles(part, part.primitive.radius, part.primitive.height, part.primitive.segments)); break;
      case "tube": triangles.push(...tubeTriangles(part, part.primitive.outerRadius, part.primitive.innerRadius, part.primitive.height, part.primitive.segments)); break;
      default: throw new Error("Unsupported CAD primitive");
    }
  }
  return triangles;
}

function vector(a: Vec3, b: Vec3): Vec3 { return [b[0] - a[0], b[1] - a[1], b[2] - a[2]]; }
function cross(a: Vec3, b: Vec3): Vec3 { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function normal(t: Triangle): Vec3 {
  const n = cross(vector(t.a, t.b), vector(t.a, t.c));
  const length = Math.hypot(...n);
  if (length < EPSILON) return [0, 0, 0];
  return [n[0] / length, n[1] / length, n[2] / length];
}
function number(value: number): string { return Math.abs(value) < EPSILON ? "0" : Number(value.toFixed(6)).toString(); }

export function exportAsciiStl(spec: CadAssemblySpec, triangles = buildCadMesh(spec)): string {
  const safeName = spec.name.replace(/[^a-zA-Z0-9_-]+/g, "_") || "InventSmith_Model";
  const lines = [`solid ${safeName}`];
  for (const t of triangles) {
    const n = normal(t);
    lines.push(`  facet normal ${number(n[0])} ${number(n[1])} ${number(n[2])}`);
    lines.push("    outer loop");
    for (const p of [t.a, t.b, t.c]) lines.push(`      vertex ${number(p[0])} ${number(p[1])} ${number(p[2])}`);
    lines.push("    endloop", "  endfacet");
  }
  lines.push(`endsolid ${safeName}`);
  return lines.join("\n");
}

export function exportDxf3dFaces(spec: CadAssemblySpec, triangles = buildCadMesh(spec)): string {
  const lines = ["0", "SECTION", "2", "HEADER", "9", "$INSUNITS", "70", "4", "0", "ENDSEC", "0", "SECTION", "2", "ENTITIES"];
  for (const t of triangles) {
    lines.push("0", "3DFACE", "8", t.partId);
    [t.a, t.b, t.c, t.c].forEach((p, index) => {
      const group = 10 + index;
      lines.push(String(group), number(p[0]), String(group + 10), number(p[1]), String(group + 20), number(p[2]));
    });
  }
  lines.push("0", "ENDSEC", "0", "EOF");
  return lines.join("\n");
}

function stepString(value: string): string { return `'${value.replace(/'/g, "''")}'`; }

export function exportFacetedStep(spec: CadAssemblySpec, triangles = buildCadMesh(spec)): string {
  let id = 1;
  const entities: string[] = [];
  const add = (body: string) => { const current = id; entities.push(`#${id}=${body};`); id += 1; return current; };

  const appContext = add("APPLICATION_CONTEXT('automotive_design')");
  add(`APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',2000,#${appContext})`);
  const productContext = add(`PRODUCT_CONTEXT('',#${appContext},'mechanical')`);
  const product = add(`PRODUCT(${stepString(spec.name)},${stepString(spec.name)},'',(#${productContext}))`);
  const formation = add(`PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE('','',#${product},.NOT_KNOWN.)`);
  const definitionContext = add(`PRODUCT_DEFINITION_CONTEXT('part definition',#${appContext},'design')`);
  const definition = add(`PRODUCT_DEFINITION('design','',#${formation},#${definitionContext})`);
  const definitionShape = add(`PRODUCT_DEFINITION_SHAPE('','',#${definition})`);
  const lengthUnit = add("(LENGTH_UNIT()NAMED_UNIT(*)SI_UNIT(.MILLI.,.METRE.))");
  const angleUnit = add("(NAMED_UNIT(*)PLANE_ANGLE_UNIT()SI_UNIT($,.RADIAN.))");
  const solidAngleUnit = add("(NAMED_UNIT(*)SI_UNIT($,.STERADIAN.)SOLID_ANGLE_UNIT())");
  const uncertainty = add(`UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-06),#${lengthUnit},'distance_accuracy_value','confusion accuracy')`);
  const context = add(`(GEOMETRIC_REPRESENTATION_CONTEXT(3)GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#${uncertainty}))GLOBAL_UNIT_ASSIGNED_CONTEXT((#${lengthUnit},#${angleUnit},#${solidAngleUnit}))REPRESENTATION_CONTEXT('',''))`);

  const breps: number[] = [];
  for (const part of spec.parts) {
    const partTriangles = triangles.filter((triangleItem) => triangleItem.partId === part.id);
    const faceIds: number[] = [];
    for (const t of partTriangles) {
      const pointIds = [t.a, t.b, t.c].map((p) => add(`CARTESIAN_POINT('',(${number(p[0])},${number(p[1])},${number(p[2])}))`));
      const loop = add(`POLY_LOOP('',(${pointIds.map((pointId) => `#${pointId}`).join(",")}))`);
      const bound = add(`FACE_OUTER_BOUND('',#${loop},.T.)`);
      faceIds.push(add(`FACE('',(#${bound}))`));
    }
    const shell = add(`CLOSED_SHELL(${stepString(part.name)},(${faceIds.map((faceId) => `#${faceId}`).join(",")}))`);
    breps.push(add(`FACETED_BREP(${stepString(part.name)},#${shell})`));
  }

  const representation = add(`SHAPE_REPRESENTATION(${stepString(spec.name)},(${breps.map((brep) => `#${brep}`).join(",")}),#${context})`);
  add(`SHAPE_DEFINITION_REPRESENTATION(#${definitionShape},#${representation})`);

  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  return [
    "ISO-10303-21;",
    "HEADER;",
    "FILE_DESCRIPTION(('InventSmith Preliminary CAD — faceted BREP'),'2;1');",
    `FILE_NAME(${stepString(`${spec.name}-${spec.revision}.step`)},${stepString(timestamp)},('InventSmith'),('Modern Methods'),'InventSmith CAD Kernel','InventSmith','');`,
    "FILE_SCHEMA(('AUTOMOTIVE_DESIGN_CC2'));",
    "ENDSEC;",
    "DATA;",
    ...entities,
    "ENDSEC;",
    "END-ISO-10303-21;",
  ].join("\n");
}

export function generateCadArtifacts(spec: CadAssemblySpec): CadArtifactBundle {
  const triangles = buildCadMesh(spec);
  return {
    stl: exportAsciiStl(spec, triangles),
    dxf: exportDxf3dFaces(spec, triangles),
    step: exportFacetedStep(spec, triangles),
    sourceJson: JSON.stringify(spec, null, 2),
    triangleCount: triangles.length,
    partCount: spec.parts.length,
  };
}
