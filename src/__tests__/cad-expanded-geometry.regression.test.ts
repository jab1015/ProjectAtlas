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

  it("generates real helical threaded-cylinder geometry for screw-driven mechanisms", () => {
    const spec: CadAssemblySpec = {
      name: "RiseJar Threaded Lift Shaft",
      units: "mm",
      revision: "A",
      assumptions: ["Pitch is provisional pending engineering review"],
      unresolvedEngineering: ["Mating thread clearance and wear require prototype testing"],
      parts: [{
        id: "lift-shaft",
        name: "Threaded lift shaft",
        material: "Acetal",
        primitive: { type: "threadedCylinder", radius: 8, height: 48, pitch: 6, threadDepth: 1.2, segments: 24 },
      }],
    };

    const mesh = buildCadMesh(spec);
    expect(mesh.length).toBeGreaterThan(1000);
    const radialValues = mesh.flatMap((triangle) => [triangle.a, triangle.b, triangle.c]).map(([x, y]) => Math.hypot(x, y));
    expect(Math.max(...radialValues)).toBeGreaterThan(8.5);
    expect(Math.min(...radialValues.filter((value) => value > 0))).toBeLessThanOrEqual(8.01);
    const artifacts = generateCadArtifacts(spec);
    expect(artifacts.sourceJson).toContain("threadedCylinder");
    expect(artifacts.step).toContain("FACETED_BREP");
    expect(artifacts.stl).toContain("RiseJar_Threaded_Lift_Shaft");
  });

  it("rejects thread geometry that would be mechanically nonsensical", () => {
    const spec: CadAssemblySpec = {
      name: "Invalid Thread",
      units: "mm",
      revision: "A",
      assumptions: [],
      unresolvedEngineering: [],
      parts: [{ id: "bad-thread", name: "Bad thread", primitive: { type: "threadedCylinder", radius: 5, height: 20, pitch: 1, threadDepth: 2.5, segments: 24 } }],
    };
    expect(() => buildCadMesh(spec)).toThrow(/thread depth|thread pitch/i);
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

  it("preserves manufacturing metadata in the editable CAD source plan", () => {
    const generation = readFileSync(join(process.cwd(), "convex/nativeCadGeneration.ts"), "utf8");
    expect(generation).toContain('finish: { type: "string" }');
    expect(generation).toContain('manufacturingProcess: { type: "string" }');
    expect(generation).toContain('interfaceNotes: { type: "array"');
    expect(generation).toContain("material: part.material.trim()");
    expect(generation).toContain("finish: part.finish.trim()");
    expect(generation).toContain("manufacturingProcess: part.manufacturingProcess.trim()");
    expect(generation).toContain("interfaceNotes: part.interfaceNotes.slice");
    expect(generation).toContain("If any of those fields are unknown, say TBD or provisional");
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
