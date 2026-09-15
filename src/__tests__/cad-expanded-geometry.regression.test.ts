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

  it("generates a helical internally threaded mating tube with preserved wall thickness", () => {
    const spec: CadAssemblySpec = {
      name: "RiseJar Mating Thread Pair",
      units: "mm",
      revision: "A",
      assumptions: ["Nominal 6 mm pitch is provisional"],
      unresolvedEngineering: ["Thread form, running clearance, backlash, wear and food-safe cleanability require engineering/prototype validation"],
      parts: [
        {
          id: "shaft",
          name: "External lift shaft",
          material: "Acetal",
          primitive: { type: "threadedCylinder", radius: 8, height: 36, pitch: 6, threadDepth: 1, segments: 24 },
        },
        {
          id: "sleeve",
          name: "Internally threaded lift sleeve",
          material: "Acetal",
          primitive: { type: "threadedTube", outerRadius: 13, innerRadius: 9.4, height: 24, pitch: 6, threadDepth: 1, segments: 24 },
        },
      ],
    };

    const mesh = buildCadMesh(spec);
    const sleeveTriangles = mesh.filter((triangle) => triangle.partId === "sleeve");
    expect(sleeveTriangles.length).toBeGreaterThan(1000);
    const sleeveRadii = sleeveTriangles.flatMap((triangle) => [triangle.a, triangle.b, triangle.c]).map(([x, y]) => Math.hypot(x, y));
    expect(Math.max(...sleeveRadii)).toBeCloseTo(13, 4);
    expect(sleeveRadii.some((value) => value > 9.8 && value < 11)).toBe(true);
    const artifacts = generateCadArtifacts(spec);
    expect(artifacts.sourceJson).toContain("threadedTube");
    expect(artifacts.step).toContain("FACETED_BREP");
  });

  it("revolves a concave annular sealing profile into a closed grooved collar", () => {
    const spec: CadAssemblySpec = {
      name: "RiseJar Seal Collar",
      units: "mm",
      revision: "A",
      assumptions: ["Seal profile dimensions are provisional"],
      unresolvedEngineering: ["Gland fill, elastomer squeeze, contact pressure and tolerance stack require engineering/prototype validation"],
      parts: [{
        id: "seal-collar",
        name: "Grooved sealing collar",
        material: "PP",
        finish: "Food-contact surface finish TBD",
        manufacturingProcess: "Injection molding candidate",
        interfaceNotes: ["Annular gland dimensions are provisional until seal selection and prototype leak testing"],
        primitive: {
          type: "revolvedProfile",
          points: [[32, -6], [40, -6], [40, 6], [37, 6], [37, 2], [35, 2], [35, 4], [32, 4]],
          segments: 32,
        },
      }],
    };

    const mesh = buildCadMesh(spec);
    expect(mesh).toHaveLength(8 * 32 * 2);
    const radii = mesh.flatMap((triangle) => [triangle.a, triangle.b, triangle.c]).map(([x, y]) => Math.hypot(x, y));
    expect(Math.min(...radii)).toBeCloseTo(32, 4);
    expect(Math.max(...radii)).toBeCloseTo(40, 4);
    const artifacts = generateCadArtifacts(spec);
    expect(artifacts.sourceJson).toContain("revolvedProfile");
    expect(artifacts.sourceJson).toContain("Annular gland dimensions are provisional");
    expect(artifacts.step).toContain("FACETED_BREP");
  });

  it("rejects self-crossing revolved profiles instead of emitting misleading seal geometry", () => {
    const spec: CadAssemblySpec = {
      name: "Invalid Seal Profile",
      units: "mm",
      revision: "A",
      assumptions: [],
      unresolvedEngineering: [],
      parts: [{
        id: "crossed-profile",
        name: "Crossed profile",
        primitive: { type: "revolvedProfile", points: [[30, -5], [40, 5], [30, 5], [40, -5]], segments: 24 },
      }],
    };
    expect(() => buildCadMesh(spec)).toThrow(/simple|self-intersecting/i);
  });

  it("rejects thread geometry that would be mechanically nonsensical", () => {
    const invalidExternal: CadAssemblySpec = {
      name: "Invalid Thread",
      units: "mm",
      revision: "A",
      assumptions: [],
      unresolvedEngineering: [],
      parts: [{ id: "bad-thread", name: "Bad thread", primitive: { type: "threadedCylinder", radius: 5, height: 20, pitch: 1, threadDepth: 2.5, segments: 24 } }],
    };
    expect(() => buildCadMesh(invalidExternal)).toThrow(/thread depth|thread pitch/i);

    const invalidInternal: CadAssemblySpec = {
      name: "Invalid Internal Thread",
      units: "mm",
      revision: "A",
      assumptions: [],
      unresolvedEngineering: [],
      parts: [{ id: "bad-sleeve", name: "Bad sleeve", primitive: { type: "threadedTube", outerRadius: 10, innerRadius: 9, height: 20, pitch: 3, threadDepth: 1.5, segments: 24 } }],
    };
    expect(() => buildCadMesh(invalidInternal)).toThrow(/wall thickness|inner radius/i);
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

  it("rejects concave profiles rather than generating misleading closed extrusion geometry", () => {
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

  it("preserves manufacturing metadata, mating-thread and sealing-profile support in the editable CAD source plan", () => {
    const generation = readFileSync(join(process.cwd(), "convex/nativeCadGeneration.ts"), "utf8");
    expect(generation).toContain('finish: { type: "string" }');
    expect(generation).toContain('manufacturingProcess: { type: "string" }');
    expect(generation).toContain('interfaceNotes: { type: "array"');
    expect(generation).toContain('"threadedTube"');
    expect(generation).toContain('"revolvedProfile"');
    expect(generation).toContain("material: part.material.trim()");
    expect(generation).toContain("finish: part.finish.trim()");
    expect(generation).toContain("manufacturingProcess: part.manufacturingProcess.trim()");
    expect(generation).toContain("interfaceNotes: part.interfaceNotes.slice");
    expect(generation).toContain("If any of those fields are unknown, say TBD or provisional");
    expect(generation).toContain("Mating external/internal thread pairs should use compatible nominal pitch");
    expect(generation).toContain("Seal groove depth, elastomer compression/squeeze");
    expect(generation).toContain("closed, non-self-intersecting annular cross-section");
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
