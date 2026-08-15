import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildCadMesh, generateCadArtifacts, type CadAssemblySpec } from "../../convex/cadGeometry";

describe("InventSmith expanded native CAD geometry", () => {
  it("generates a closed tapered frustum suitable for tapered product forms", () => {
    const spec: CadAssemblySpec = {
      name: "Tapered Container",
      units: "mm",
      revision: "A",
      assumptions: [],
      unresolvedEngineering: [],
      parts: [{
        id: "body",
        name: "Tapered body",
        material: "PP",
        primitive: { type: "frustum", bottomRadius: 38, topRadius: 44, height: 90, segments: 24 },
      }],
    };

    const mesh = buildCadMesh(spec);
    expect(mesh).toHaveLength(96);
    const artifacts = generateCadArtifacts(spec);
    expect(artifacts.step).toContain("FACETED_BREP");
    expect(artifacts.stl).toContain("solid Tapered_Container");
    expect(artifacts.partCount).toBe(1);
  });

  it("extrudes a custom convex product profile into STEP/STL/DXF geometry", () => {
    const spec: CadAssemblySpec = {
      name: "Custom Bracket",
      units: "mm",
      revision: "B",
      assumptions: ["Dimensions are preliminary"],
      unresolvedEngineering: ["Corner radii require engineering review"],
      parts: [{
        id: "bracket",
        name: "Hexagonal bracket",
        material: "ABS",
        primitive: {
          type: "extrudedConvexPolygon",
          points: [[-30, -15], [10, -15], [30, 0], [10, 20], [-25, 20], [-35, 0]],
          height: 8,
        },
      }],
    };

    const mesh = buildCadMesh(spec);
    expect(mesh.length).toBeGreaterThan(12);
    const artifacts = generateCadArtifacts(spec);
    expect(artifacts.dxf).toContain("3DFACE");
    expect(artifacts.sourceJson).toContain("extrudedConvexPolygon");
    expect(artifacts.triangleCount).toBe(mesh.length);
  });

  it("rejects concave profiles rather than generating misleading closed geometry", () => {
    const spec: CadAssemblySpec = {
      name: "Unsafe Concave",
      units: "mm",
      revision: "A",
      assumptions: [],
      unresolvedEngineering: [],
      parts: [{
        id: "concave",
        name: "Concave profile",
        primitive: {
          type: "extrudedConvexPolygon",
          points: [[0, 0], [30, 0], [10, 10], [30, 30], [0, 30]],
          height: 5,
        },
      }],
    };

    expect(() => buildCadMesh(spec)).toThrow(/convex/i);
  });

  it("keeps orthographic and exploded-view artifacts visible in the Design Studio", () => {
    const page = readFileSync(join(process.cwd(), "src/app/(app)/invention/[id]/design/page.tsx"), "utf8");
    expect(page).toContain('kind === "cad_orthographic_views"');
    expect(page).toContain('kind === "cad_exploded_view"');
    expect(page).not.toContain("currentCadArtifacts.slice(0, 4)");
    expect(page).toContain("Exploded assembly view");
    expect(page).toContain("Orthographic views");
  });
});
