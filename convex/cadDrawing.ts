import { buildCadMesh, type CadAssemblySpec, type Triangle, type Vec3 } from "./cadGeometry";

interface ProjectedPoint { x: number; y: number; }
interface Segment { a: ProjectedPoint; b: ProjectedPoint; partId: string; }

type Projection = "front" | "top" | "right" | "isometric";

function project([x, y, z]: Vec3, projection: Projection): ProjectedPoint {
  if (projection === "front") return { x, y: -z };
  if (projection === "top") return { x, y: -y };
  if (projection === "right") return { x: y, y: -z };
  const isoX = (x - y) * Math.cos(Math.PI / 6);
  const isoY = -z + (x + y) * Math.sin(Math.PI / 6);
  return { x: isoX, y: isoY };
}

function edgesFromTriangles(triangles: Triangle[], projection: Projection, explode = false): Segment[] {
  const partOrder = [...new Set(triangles.map((triangle) => triangle.partId))];
  const explodeOffsets = new Map(partOrder.map((partId, index) => [partId, index - (partOrder.length - 1) / 2]));
  const segments: Segment[] = [];
  for (const triangle of triangles) {
    const amount = explode ? (explodeOffsets.get(triangle.partId) ?? 0) * 35 : 0;
    const points = [triangle.a, triangle.b, triangle.c].map((point) => {
      const shifted: Vec3 = [point[0] + amount, point[1] - amount * 0.25, point[2] + amount * 0.35];
      return project(shifted, projection);
    });
    segments.push(
      { a: points[0], b: points[1], partId: triangle.partId },
      { a: points[1], b: points[2], partId: triangle.partId },
      { a: points[2], b: points[0], partId: triangle.partId },
    );
  }
  return segments;
}

function bounds(segments: Segment[]) {
  const points = segments.flatMap((segment) => [segment.a, segment.b]);
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys),
  };
}

function svgPanel(segments: Segment[], x: number, y: number, width: number, height: number, title: string): string {
  const box = bounds(segments);
  const spanX = Math.max(1, box.maxX - box.minX);
  const spanY = Math.max(1, box.maxY - box.minY);
  const padding = 28;
  const scale = Math.min((width - padding * 2) / spanX, (height - padding * 2 - 24) / spanY);
  const ox = x + (width - spanX * scale) / 2 - box.minX * scale;
  const oy = y + 26 + (height - 26 - spanY * scale) / 2 - box.minY * scale;
  const lines = segments.map((segment) => `<line x1="${(ox + segment.a.x * scale).toFixed(2)}" y1="${(oy + segment.a.y * scale).toFixed(2)}" x2="${(ox + segment.b.x * scale).toFixed(2)}" y2="${(oy + segment.b.y * scale).toFixed(2)}" data-part="${segment.partId.replace(/"/g, "")}" />`).join("");
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="12" class="panel"/><text x="${x + 16}" y="${y + 20}" class="panel-title">${title}</text><g class="geometry">${lines}</g></g>`;
}

function svgDocument(body: string, title: string, subtitle: string, width: number, height: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title.replace(/"/g, "")}">
<style>
  .bg{fill:#fff}.panel{fill:#fafafa;stroke:#d4d4d8;stroke-width:1}.geometry{fill:none;stroke:#18181b;stroke-width:1;vector-effect:non-scaling-stroke}.panel-title{font:600 13px ui-sans-serif,system-ui;fill:#3f3f46}.title{font:700 22px ui-sans-serif,system-ui;fill:#18181b}.subtitle{font:400 12px ui-sans-serif,system-ui;fill:#71717a}.note{font:400 11px ui-sans-serif,system-ui;fill:#a16207}
</style>
<rect class="bg" width="100%" height="100%"/><text x="28" y="34" class="title">${title}</text><text x="28" y="54" class="subtitle">${subtitle}</text>${body}
<text x="28" y="${height - 18}" class="note">Preliminary CAD visualization — verify dimensions, tolerances, interfaces, manufacturability and safety before production release.</text>
</svg>`;
}

export function generateOrthographicDrawing(spec: CadAssemblySpec): string {
  const mesh = buildCadMesh(spec);
  const width = 1200; const height = 500; const top = 82; const gap = 16; const panelWidth = (width - 56 - gap * 2) / 3; const panelHeight = 370;
  const body = [
    svgPanel(edgesFromTriangles(mesh, "front"), 28, top, panelWidth, panelHeight, "FRONT"),
    svgPanel(edgesFromTriangles(mesh, "top"), 28 + panelWidth + gap, top, panelWidth, panelHeight, "TOP"),
    svgPanel(edgesFromTriangles(mesh, "right"), 28 + (panelWidth + gap) * 2, top, panelWidth, panelHeight, "RIGHT"),
  ].join("");
  return svgDocument(body, `${spec.name} — Orthographic Views`, `Revision ${spec.revision} · units: millimeters · generated from InventSmith native geometry`, width, height);
}

export function generateExplodedDrawing(spec: CadAssemblySpec): string {
  const mesh = buildCadMesh(spec);
  const width = 1000; const height = 720;
  const segments = edgesFromTriangles(mesh, "isometric", true);
  const body = svgPanel(segments, 28, 82, 944, 570, "EXPLODED ISOMETRIC ASSEMBLY");
  return svgDocument(body, `${spec.name} — Exploded Assembly`, `Revision ${spec.revision} · ${spec.parts.length} parts · visual separation is illustrative, not assembly clearance`, width, height);
}
