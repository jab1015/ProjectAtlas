export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

export type CadPrimitive =
  | { type: "box"; size: Vec3 }
  | { type: "cylinder"; radius: number; height: number; segments?: number }
  | { type: "tube"; outerRadius: number; innerRadius: number; height: number; segments?: number }
  | { type: "frustum"; bottomRadius: number; topRadius: number; height: number; segments?: number }
  | { type: "threadedCylinder"; radius: number; height: number; pitch: number; threadDepth: number; segments?: number }
  | { type: "threadedTube"; outerRadius: number; innerRadius: number; height: number; pitch: number; threadDepth: number; segments?: number }
  | { type: "revolvedProfile"; points: Vec2[]; segments?: number }
  | { type: "extrudedConvexPolygon"; points: Vec2[]; height: number };

export interface CadPartSpec {
  id: string;
  name: string;
  primitive: CadPrimitive;
  position?: Vec3;
  rotationDeg?: Vec3;
  material?: string;
  finish?: string;
  manufacturingProcess?: string;
  interfaceNotes?: string[];
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

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
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

function frustumTriangles(part: CadPartSpec, bottomValue: number, topValue: number, heightValue: number, segmentValue?: number): Triangle[] {
  const bottomRadius = finitePositive(bottomValue, "frustum bottom radius");
  const topRadius = finitePositive(topValue, "frustum top radius");
  const height = finitePositive(heightValue, "frustum height");
  const count = segments(segmentValue);
  const z0 = -height / 2; const z1 = height / 2;
  const out: Triangle[] = [];

  for (let i = 0; i < count; i += 1) {
    const a0 = 2 * Math.PI * i / count;
    const a1 = 2 * Math.PI * (i + 1) / count;
    const b0: Vec3 = [bottomRadius * Math.cos(a0), bottomRadius * Math.sin(a0), z0];
    const b1: Vec3 = [bottomRadius * Math.cos(a1), bottomRadius * Math.sin(a1), z0];
    const t0: Vec3 = [topRadius * Math.cos(a0), topRadius * Math.sin(a0), z1];
    const t1: Vec3 = [topRadius * Math.cos(a1), topRadius * Math.sin(a1), z1];
    out.push(triangle(part, b0, b1, t1), triangle(part, b0, t1, t0));
    out.push(triangle(part, [0, 0, z0], b1, b0));
    out.push(triangle(part, [0, 0, z1], t0, t1));
  }
  return out;
}

function wrappedPhase(value: number): number {
  const twoPi = 2 * Math.PI;
  const normalized = ((value + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
  return normalized;
}

function threadedCylinderTriangles(part: CadPartSpec, radiusValue: number, heightValue: number, pitchValue: number, depthValue: number, segmentValue?: number): Triangle[] {
  const radius = finitePositive(radiusValue, "threaded cylinder base radius");
  const height = finitePositive(heightValue, "threaded cylinder height");
  const pitch = finitePositive(pitchValue, "thread pitch");
  const depth = finitePositive(depthValue, "thread depth");
  if (depth >= radius * 0.4) throw new Error("thread depth is too large relative to the base radius");
  if (pitch <= depth) throw new Error("thread pitch must be larger than thread depth");
  const around = segments(segmentValue);
  const turns = height / pitch;
  const axialSteps = Math.max(8, Math.min(512, Math.ceil(turns * around)));
  const z0 = -height / 2;
  const z1 = height / 2;
  const out: Triangle[] = [];

  const surfacePoint = (angle: number, z: number): Vec3 => {
    const phase = wrappedPhase(angle - 2 * Math.PI * (z - z0) / pitch);
    const normalized = Math.abs(phase) / Math.PI;
    const ridge = Math.max(0, 1 - normalized * 4);
    const localRadius = radius + depth * ridge;
    return [localRadius * Math.cos(angle), localRadius * Math.sin(angle), z];
  };

  for (let zi = 0; zi < axialSteps; zi += 1) {
    const za = z0 + height * zi / axialSteps;
    const zb = z0 + height * (zi + 1) / axialSteps;
    for (let ai = 0; ai < around; ai += 1) {
      const a0 = 2 * Math.PI * ai / around;
      const a1 = 2 * Math.PI * (ai + 1) / around;
      const p00 = surfacePoint(a0, za);
      const p01 = surfacePoint(a1, za);
      const p10 = surfacePoint(a0, zb);
      const p11 = surfacePoint(a1, zb);
      out.push(triangle(part, p00, p01, p11), triangle(part, p00, p11, p10));
    }
  }

  for (let ai = 0; ai < around; ai += 1) {
    const a0 = 2 * Math.PI * ai / around;
    const a1 = 2 * Math.PI * (ai + 1) / around;
    const b0 = surfacePoint(a0, z0);
    const b1 = surfacePoint(a1, z0);
    const t0 = surfacePoint(a0, z1);
    const t1 = surfacePoint(a1, z1);
    out.push(triangle(part, [0, 0, z0], b1, b0));
    out.push(triangle(part, [0, 0, z1], t0, t1));
  }
  return out;
}

function threadedTubeTriangles(part: CadPartSpec, outerValue: number, innerValue: number, heightValue: number, pitchValue: number, depthValue: number, segmentValue?: number): Triangle[] {
  const outer = finitePositive(outerValue, "threaded tube outer radius");
  const inner = finitePositive(innerValue, "threaded tube minimum inner radius");
  const height = finitePositive(heightValue, "threaded tube height");
  const pitch = finitePositive(pitchValue, "internal thread pitch");
  const depth = finitePositive(depthValue, "internal thread depth");
  if (inner >= outer) throw new Error("threaded tube inner radius must be smaller than outer radius");
  if (inner + depth >= outer) throw new Error("internal thread depth leaves no valid tube wall thickness");
  if (pitch <= depth) throw new Error("internal thread pitch must be larger than thread depth");
  const around = segments(segmentValue);
  const turns = height / pitch;
  const axialSteps = Math.max(8, Math.min(512, Math.ceil(turns * around)));
  const z0 = -height / 2;
  const z1 = height / 2;
  const out: Triangle[] = [];

  const outerPoint = (angle: number, z: number): Vec3 => [outer * Math.cos(angle), outer * Math.sin(angle), z];
  const innerPoint = (angle: number, z: number): Vec3 => {
    const phase = wrappedPhase(angle - 2 * Math.PI * (z - z0) / pitch);
    const normalized = Math.abs(phase) / Math.PI;
    const groove = Math.max(0, 1 - normalized * 4);
    const localRadius = inner + depth * groove;
    return [localRadius * Math.cos(angle), localRadius * Math.sin(angle), z];
  };

  for (let zi = 0; zi < axialSteps; zi += 1) {
    const za = z0 + height * zi / axialSteps;
    const zb = z0 + height * (zi + 1) / axialSteps;
    for (let ai = 0; ai < around; ai += 1) {
      const a0 = 2 * Math.PI * ai / around;
      const a1 = 2 * Math.PI * (ai + 1) / around;
      const o00 = outerPoint(a0, za);
      const o01 = outerPoint(a1, za);
      const o10 = outerPoint(a0, zb);
      const o11 = outerPoint(a1, zb);
      const i00 = innerPoint(a0, za);
      const i01 = innerPoint(a1, za);
      const i10 = innerPoint(a0, zb);
      const i11 = innerPoint(a1, zb);
      out.push(triangle(part, o00, o01, o11), triangle(part, o00, o11, o10));
      out.push(triangle(part, i00, i11, i01), triangle(part, i00, i10, i11));
    }
  }

  for (let ai = 0; ai < around; ai += 1) {
    const a0 = 2 * Math.PI * ai / around;
    const a1 = 2 * Math.PI * (ai + 1) / around;
    const ob0 = outerPoint(a0, z0);
    const ob1 = outerPoint(a1, z0);
    const ot0 = outerPoint(a0, z1);
    const ot1 = outerPoint(a1, z1);
    const ib0 = innerPoint(a0, z0);
    const ib1 = innerPoint(a1, z0);
    const it0 = innerPoint(a0, z1);
    const it1 = innerPoint(a1, z1);
    out.push(triangle(part, ob0, ib1, ob1), triangle(part, ob0, ib0, ib1));
    out.push(triangle(part, ot0, ot1, it1), triangle(part, ot0, it1, it0));
  }
  return out;
}

function polygonArea(points: Vec2[]): number {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[(i + 1) % points.length];
    area += x0 * y1 - x1 * y0;
  }
  return area / 2;
}

function orientation2d(a: Vec2, b: Vec2, c: Vec2) {
  const value = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  if (Math.abs(value) < EPSILON) return 0;
  return Math.sign(value);
}

function onSegment2d(a: Vec2, b: Vec2, p: Vec2) {
  return p[0] >= Math.min(a[0], b[0]) - EPSILON && p[0] <= Math.max(a[0], b[0]) + EPSILON &&
    p[1] >= Math.min(a[1], b[1]) - EPSILON && p[1] <= Math.max(a[1], b[1]) + EPSILON;
}

function segmentsIntersect2d(a: Vec2, b: Vec2, c: Vec2, d: Vec2) {
  const o1 = orientation2d(a, b, c);
  const o2 = orientation2d(a, b, d);
  const o3 = orientation2d(c, d, a);
  const o4 = orientation2d(c, d, b);
  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment2d(a, b, c)) return true;
  if (o2 === 0 && onSegment2d(a, b, d)) return true;
  if (o3 === 0 && onSegment2d(c, d, a)) return true;
  if (o4 === 0 && onSegment2d(c, d, b)) return true;
  return false;
}

function isSimplePolygon(points: Vec2[]) {
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < EPSILON) return false;
    for (let j = i + 1; j < points.length; j += 1) {
      const nextI = (i + 1) % points.length;
      const nextJ = (j + 1) % points.length;
      if (i === j || nextI === j || nextJ === i) continue;
      if (segmentsIntersect2d(a, b, points[j], points[nextJ])) return false;
    }
  }
  return true;
}

function revolvedProfileTriangles(part: CadPartSpec, rawPoints: Vec2[], segmentValue?: number): Triangle[] {
  if (rawPoints.length < 3 || rawPoints.length > 32) throw new Error("revolved profile requires 3–32 radius/Z points");
  let points = rawPoints.map(([radius, z], index) => [finitePositive(radius, `revolved profile point ${index + 1} radius`), finite(z, `revolved profile point ${index + 1} z`)] as Vec2);
  if (!isSimplePolygon(points)) throw new Error("revolved profile must be a simple non-self-intersecting closed annular profile");
  if (Math.abs(polygonArea(points)) < EPSILON) throw new Error("revolved profile must enclose non-zero cross-sectional area");
  if (polygonArea(points) < 0) points = [...points].reverse();
  const count = segments(segmentValue);
  const out: Triangle[] = [];

  const pointAt = ([radius, z]: Vec2, angle: number): Vec3 => [radius * Math.cos(angle), radius * Math.sin(angle), z];
  for (let edge = 0; edge < points.length; edge += 1) {
    const p0 = points[edge];
    const p1 = points[(edge + 1) % points.length];
    for (let i = 0; i < count; i += 1) {
      const a0 = 2 * Math.PI * i / count;
      const a1 = 2 * Math.PI * (i + 1) / count;
      const p00 = pointAt(p0, a0);
      const p01 = pointAt(p0, a1);
      const p10 = pointAt(p1, a0);
      const p11 = pointAt(p1, a1);
      out.push(triangle(part, p00, p01, p11), triangle(part, p00, p11, p10));
    }
  }
  return out;
}

function isConvexPolygon(points: Vec2[]): boolean {
  let sign = 0;
  for (let i = 0; i < points.length; i += 1) {
    const [ax, ay] = points[i];
    const [bx, by] = points[(i + 1) % points.length];
    const [cx, cy] = points[(i + 2) % points.length];
    const crossValue = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);
    if (Math.abs(crossValue) < EPSILON) continue;
    const current = Math.sign(crossValue);
    if (sign === 0) sign = current;
    else if (current !== sign) return false;
  }
  return sign !== 0;
}

function extrudedConvexPolygonTriangles(part: CadPartSpec, rawPoints: Vec2[], heightValue: number): Triangle[] {
  const height = finitePositive(heightValue, "extrusion height");
  if (rawPoints.length < 3 || rawPoints.length > 32) throw new Error("extruded convex polygon requires 3–32 points");
  let points = rawPoints.map(([x, y], index) => [finite(x, `polygon point ${index + 1} x`), finite(y, `polygon point ${index + 1} y`)] as Vec2);
  if (!isConvexPolygon(points)) throw new Error("extruded polygon must be convex and non-degenerate");
  if (polygonArea(points) < 0) points = [...points].reverse();

  const z0 = -height / 2; const z1 = height / 2;
  const out: Triangle[] = [];
  const bottom = points.map(([x, y]) => [x, y, z0] as Vec3);
  const top = points.map(([x, y]) => [x, y, z1] as Vec3);

  for (let i = 1; i < points.length - 1; i += 1) {
    out.push(triangle(part, bottom[0], bottom[i + 1], bottom[i]));
    out.push(triangle(part, top[0], top[i], top[i + 1]));
  }
  for (let i = 0; i < points.length; i += 1) {
    const next = (i + 1) % points.length;
    out.push(triangle(part, bottom[i], bottom[next], top[next]), triangle(part, bottom[i], top[next], top[i]));
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
      case "frustum": triangles.push(...frustumTriangles(part, part.primitive.bottomRadius, part.primitive.topRadius, part.primitive.height, part.primitive.segments)); break;
      case "threadedCylinder": triangles.push(...threadedCylinderTriangles(part, part.primitive.radius, part.primitive.height, part.primitive.pitch, part.primitive.threadDepth, part.primitive.segments)); break;
      case "threadedTube": triangles.push(...threadedTubeTriangles(part, part.primitive.outerRadius, part.primitive.innerRadius, part.primitive.height, part.primitive.pitch, part.primitive.threadDepth, part.primitive.segments)); break;
      case "revolvedProfile": triangles.push(...revolvedProfileTriangles(part, part.primitive.points, part.primitive.segments)); break;
      case "extrudedConvexPolygon": triangles.push(...extrudedConvexPolygonTriangles(part, part.primitive.points, part.primitive.height)); break;
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
  const formation = add(`PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE('','',#${product},.NOT_KN.)`);
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
