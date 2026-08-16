import { buildCadMesh, type CadAssemblySpec, type Triangle, type Vec3 } from "./cadGeometry";

interface ProjectedPoint { x: number; y: number; }
interface Segment { a: ProjectedPoint; b: ProjectedPoint; partId: string; }
interface PanelDimensions { horizontal: number; vertical: number; horizontalLabel: string; verticalLabel: string; }

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

function meshBounds(triangles: Triangle[]) {
  const points = triangles.flatMap((triangle) => [triangle.a, triangle.b, triangle.c]);
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const zs = points.map((point) => point[2]);
  return {
    x: Math.max(...xs) - Math.min(...xs),
    y: Math.max(...ys) - Math.min(...ys),
    z: Math.max(...zs) - Math.min(...zs),
  };
}

function dimensionText(value: number) {
  const rounded = Number(value.toFixed(2));
  return `${rounded} mm`;
}

function dimensionOverlay(left: number, top: number, right: number, bottom: number, dimensions: PanelDimensions) {
  const horizontalY = bottom + 22;
  const verticalX = left - 22;
  const horizontalMid = (left + right) / 2;
  const verticalMid = (top + bottom) / 2;
  return `<g class="dimensions">
    <line x1="${left.toFixed(2)}" y1="${horizontalY.toFixed(2)}" x2="${right.toFixed(2)}" y2="${horizontalY.toFixed(2)}"/>
    <line x1="${left.toFixed(2)}" y1="${(horizontalY - 7).toFixed(2)}" x2="${left.toFixed(2)}" y2="${(horizontalY + 7).toFixed(2)}"/>
    <line x1="${right.toFixed(2)}" y1="${(horizontalY - 7).toFixed(2)}" x2="${right.toFixed(2)}" y2="${(horizontalY + 7).toFixed(2)}"/>
    <text x="${horizontalMid.toFixed(2)}" y="${(horizontalY - 5).toFixed(2)}" text-anchor="middle" class="dimension-text">${dimensions.horizontalLabel}: ${dimensionText(dimensions.horizontal)}</text>
    <line x1="${verticalX.toFixed(2)}" y1="${top.toFixed(2)}" x2="${verticalX.toFixed(2)}" y2="${bottom.toFixed(2)}"/>
    <line x1="${(verticalX - 7).toFixed(2)}" y1="${top.toFixed(2)}" x2="${(verticalX + 7).toFixed(2)}" y2="${top.toFixed(2)}"/>
    <line x1="${(verticalX - 7).toFixed(2)}" y1="${bottom.toFixed(2)}" x2="${(verticalX + 7).toFixed(2)}" y2="${bottom.toFixed(2)}"/>
    <text x="${(verticalX - 7).toFixed(2)}" y="${verticalMid.toFixed(2)}" text-anchor="middle" class="dimension-text" transform="rotate(-90 ${(verticalX - 7).toFixed(2)} ${verticalMid.toFixed(2)})">${dimensions.verticalLabel}: ${dimensionText(dimensions.vertical)}</text>
  </g>`;
}

function svgPanel(segments: Segment[], x: number, y: number, width: number, height: number, title: string, dimensions?: PanelDimensions): string {
  const box = bounds(segments);
  const spanX = Math.max(1, box.maxX - box.minX);
  const spanY = Math.max(1, box.maxY - box.minY);
  const paddingLeft = dimensions ? 48 : 28;
  const paddingRight = 28;
  const paddingTop = 34;
  const paddingBottom = dimensions ? 58 : 28;
  const drawableWidth = width - paddingLeft - paddingRight;
  const drawableHeight = height - paddingTop - paddingBottom;
  const scale = Math.min(drawableWidth / spanX, drawableHeight / spanY);
  const geometryLeft = x + paddingLeft + (drawableWidth - spanX * scale) / 2;
  const geometryTop = y + paddingTop + (drawableHeight - spanY * scale) / 2;
  const ox = geometryLeft - box.minX * scale;
  const oy = geometryTop - box.minY * scale;
  const geometryRight = geometryLeft + spanX * scale;
  const geometryBottom = geometryTop + spanY * scale;
  const lines = segments.map((segment) => `<line x1="${(ox + segment.a.x * scale).toFixed(2)}" y1="${(oy + segment.a.y * scale).toFixed(2)}" x2="${(ox + segment.b.x * scale).toFixed(2)}" y2="${(oy + segment.b.y * scale).toFixed(2)}" data-part="${segment.partId.replace(/"/g, "")}" />`).join("");
  const dimensionMarkup = dimensions ? dimensionOverlay(geometryLeft, geometryTop, geometryRight, geometryBottom, dimensions) : "";
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="12" class="panel"/><text x="${x + 16}" y="${y + 20}" class="panel-title">${title}</text><g class="geometry">${lines}</g>${dimensionMarkup}</g>`;
}

function svgDocument(body: string, title: string, subtitle: string, width: number, height: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title.replace(/"/g, "")}">
<style>
  .bg{fill:#fff}.panel{fill:#fafafa;stroke:#d4d4d8;stroke-width:1}.geometry{fill:none;stroke:#18181b;stroke-width:1;vector-effect:non-scaling-stroke}.dimensions{fill:none;stroke:#2563eb;stroke-width:1;vector-effect:non-scaling-stroke}.dimension-text{fill:#1d4ed8;stroke:none;font:600 10px ui-sans-serif,system-ui}.panel-title{font:600 13px ui-sans-serif,system-ui;fill:#3f3f46}.title{font:700 22px ui-sans-serif,system-ui;fill:#18181b}.subtitle{font:400 12px ui-sans-serif,system-ui;fill:#71717a}.note{font:400 11px ui-sans-serif,system-ui;fill:#a16207}
</style>
<rect class="bg" width="100%" height="100%"/><text x="28" y="34" class="title">${title}</text><text x="28" y="54" class="subtitle">${subtitle}</text>${body}
<text x="28" y="${height - 18}" class="note">Preliminary CAD drawing — overall dimensions derive from current geometry; verify critical dimensions, tolerances, fits, interfaces, manufacturability and safety before production release.</text>
</svg>`;
}

export function generateOrthographicDrawing(spec: CadAssemblySpec): string {
  const mesh = buildCadMesh(spec);
  const overall = meshBounds(mesh);
  const width = 1200; const height = 530; const top = 82; const gap = 16; const panelWidth = (width - 56 - gap * 2) / 3; const panelHeight = 400;
  const body = [
    svgPanel(edgesFromTriangles(mesh, "front"), 28, top, panelWidth, panelHeight, "FRONT", { horizontal: overall.x, vertical: overall.z, horizontalLabel: "X", verticalLabel: "Z" }),
    svgPanel(edgesFromTriangles(mesh, "top"), 28 + panelWidth + gap, top, panelWidth, panelHeight, "TOP", { horizontal: overall.x, vertical: overall.y, horizontalLabel: "X", verticalLabel: "Y" }),
    svgPanel(edgesFromTriangles(mesh, "right"), 28 + (panelWidth + gap) * 2, top, panelWidth, panelHeight, "RIGHT", { horizontal: overall.y, vertical: overall.z, horizontalLabel: "Y", verticalLabel: "Z" }),
  ].join("");
  return svgDocument(body, `${spec.name} — Dimensioned Orthographic Views`, `Revision ${spec.revision} · units: millimeters · overall dimensions derived from InventSmith native geometry`, width, height);
}

export function generateExplodedDrawing(spec: CadAssemblySpec): string {
  const mesh = buildCadMesh(spec);
  const width = 1000; const height = 720;
  const segments = edgesFromTriangles(mesh, "isometric", true);
  const body = svgPanel(segments, 28, 82, 944, 570, "EXPLODED ISOMETRIC ASSEMBLY");
  return svgDocument(body, `${spec.name} — Exploded Assembly`, `Revision ${spec.revision} · ${spec.parts.length} parts · visual separation is illustrative, not assembly clearance`, width, height);
}
