import { describe, expect, it } from "vitest";
import { buildCadMesh, generateCadArtifacts, type CadAssemblySpec } from "@convex/cadGeometry";
import { generateOrthographicDrawing } from "@convex/cadDrawing";

const fixture: CadAssemblySpec = {
  name: "Countertop Rack Fixture",
  units: "mm",
  revision: "A",
  assumptions: ["Fixture dimensions are for CAD pipeline verification only."],
  unresolvedEngineering: ["Final load and tolerance review required."],
  parts: [
    {
      id: "rail-left",
      name: "Left Rail",
      primitive: { type: "box", size: [300, 20, 12] },
      position: [0, -100, 0],
      material: "ABS",
    },
    {
      id: "basket-rim",
      name: "Basket Rim",
      primitive: { type: "tube", outerRadius: 80, innerRadius: 70, height: 20, segments: 24 },
      position: [0, 0, -20],
      material: "PP",
    },
    {
      id: "post",
      name: "Adjustment Post",
      primitive: { type: "cylinder", radius: 8, height: 100, segments: 24 },
      position: [120, 0, 40],
      material: "Stainless steel",
    },
  ],
};

describe("InventSmith native CAD kernel", () => {
  it("creates closed triangle geometry for supported assembly primitives", () => {
    const mesh = buildCadMesh(fixture);
    expect(mesh.length).toBeGreaterThan(100);
    expect(new Set(mesh.map((triangle) => triangle.partId))).toEqual(new Set(["rail-left", "basket-rim", "post"]));
    for (const triangle of mesh) {
      for (const point of [triangle.a, triangle.b, triangle.c]) {
        point.forEach((value) => expect(Number.isFinite(value)).toBe(true));
      }
    }
  });

  it("exports actual STEP, STL and DXF CAD artifacts plus editable source spec", () => {
    const artifacts = generateCadArtifacts(fixture);

    expect(artifacts.step).toContain("ISO-10303-21;");
    expect(artifacts.step).toContain("FACETED_BREP");
    expect(artifacts.step).toContain("END-ISO-10303-21;");
    expect(artifacts.stl).toContain("solid Countertop_Rack_Fixture");
    expect(artifacts.stl).toContain("facet normal");
    expect(artifacts.dxf).toContain("3DFACE");
    expect(artifacts.dxf).toContain("$INSUNITS");
    expect(JSON.parse(artifacts.sourceJson).parts).toHaveLength(3);
    expect(artifacts.partCount).toBe(3);
  });

  it("produces dimensioned front/top/right engineering views from current geometry", () => {
    const drawing = generateOrthographicDrawing(fixture);
    expect(drawing).toContain("Dimensioned Orthographic Views");
    expect(drawing).toContain("FRONT");
    expect(drawing).toContain("TOP");
    expect(drawing).toContain("RIGHT");
    expect(drawing).toContain("X: 300 mm");
    expect(drawing).toMatch(/Y: \d+(?:\.\d+)? mm/);
    expect(drawing).toMatch(/Z: \d+(?:\.\d+)? mm/);
    expect(drawing).toContain("overall dimensions derive from current geometry");
    expect(drawing).toContain("verify critical dimensions, tolerances, fits, interfaces");
  });

  it("rejects geometrically impossible tube specifications", () => {
    const invalid: CadAssemblySpec = {
      ...fixture,
      parts: [{ id: "bad", name: "Bad tube", primitive: { type: "tube", outerRadius: 10, innerRadius: 12, height: 20 } }],
    };
    expect(() => buildCadMesh(invalid)).toThrow(/inner radius/i);
  });
});
