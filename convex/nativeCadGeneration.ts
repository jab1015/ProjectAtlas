"use node";

import OpenAI from "openai";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { makeFunctionReference } from "convex/server";
import type { Id } from "./_generated/dataModel";
import { costUnitsFromTokens } from "./workOrchestratorLogic";
import { generateCadArtifacts, type CadAssemblySpec, type CadPartSpec, type Vec2 } from "./cadGeometry";
import { generateExplodedDrawing, generateOrthographicDrawing } from "./cadDrawing";

const getNativeCadContext = makeFunctionReference<"query", { inventionId: Id<"inventions">; workItemId: Id<"atlasWorkItems"> }, any>("nativeCad:getNativeCadContext");
const recordNativeCadSuccess = makeFunctionReference<"mutation", any, { discarded: boolean; actualCostUnits: number }>("nativeCad:recordNativeCadSuccess");
const recordNativeCadFailure = makeFunctionReference<"mutation", { inventionId: Id<"inventions">; workItemId: Id<"atlasWorkItems">; error: string; failedAt: number }, { willRetry: boolean }>("nativeCad:recordNativeCadFailure");

const vecSchema = { type: "array", minItems: 3, maxItems: 3, items: { type: "number" } } as const;
const vec2Schema = { type: "array", minItems: 2, maxItems: 2, items: { type: "number" } } as const;
const cadSpecSchema = {
  type: "object", additionalProperties: false,
  properties: {
    assemblyName: { type: "string" }, revision: { type: "string" },
    assumptions: { type: "array", items: { type: "string" } },
    unresolvedEngineering: { type: "array", items: { type: "string" } },
    parts: { type: "array", minItems: 1, maxItems: 24, items: { type: "object", additionalProperties: false, properties: {
      id: { type: "string" }, name: { type: "string" }, material: { type: "string" }, finish: { type: "string" }, manufacturingProcess: { type: "string" }, interfaceNotes: { type: "array", items: { type: "string" } }, primitiveType: { type: "string", enum: ["box", "cylinder", "tube", "frustum", "threadedCylinder", "extrudedConvexPolygon"] },
      sizeX: { type: "number" }, sizeY: { type: "number" }, sizeZ: { type: "number" }, radius: { type: "number" }, outerRadius: { type: "number" }, innerRadius: { type: "number" }, bottomRadius: { type: "number" }, topRadius: { type: "number" }, height: { type: "number" }, pitch: { type: "number" }, threadDepth: { type: "number" }, segments: { type: "integer" }, polygonPoints: { type: "array", minItems: 0, maxItems: 32, items: vec2Schema }, position: vecSchema, rotationDeg: vecSchema,
    }, required: ["id", "name", "material", "finish", "manufacturingProcess", "interfaceNotes", "primitiveType", "sizeX", "sizeY", "sizeZ", "radius", "outerRadius", "innerRadius", "bottomRadius", "topRadius", "height", "pitch", "threadDepth", "segments", "polygonPoints", "position", "rotationDeg"] } },
  },
  required: ["assemblyName", "revision", "assumptions", "unresolvedEngineering", "parts"],
} as const;

interface ModelPart {
  id: string;
  name: string;
  material: string;
  finish: string;
  manufacturingProcess: string;
  interfaceNotes: string[];
  primitiveType: "box" | "cylinder" | "tube" | "frustum" | "threadedCylinder" | "extrudedConvexPolygon";
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  radius: number;
  outerRadius: number;
  innerRadius: number;
  bottomRadius: number;
  topRadius: number;
  height: number;
  pitch: number;
  threadDepth: number;
  segments: number;
  polygonPoints: Array<[number, number]>;
  position: [number, number, number];
  rotationDeg: [number, number, number];
}
interface ModelCadSpec { assemblyName: string; revision: string; assumptions: string[]; unresolvedEngineering: string[]; parts: ModelPart[]; }

function bounded(value: number, minimum: number, maximum: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} is not finite`);
  if (value < minimum || value > maximum) throw new Error(`${label} is outside the supported CAD range (${minimum}–${maximum} mm)`);
  return value;
}

function toPart(part: ModelPart): CadPartSpec {
  const base = {
    id: part.id.trim().slice(0, 80),
    name: part.name.trim().slice(0, 160),
    material: part.material.trim().slice(0, 160),
    finish: part.finish.trim().slice(0, 240),
    manufacturingProcess: part.manufacturingProcess.trim().slice(0, 240),
    interfaceNotes: part.interfaceNotes.slice(0, 20).map((item) => item.trim().slice(0, 500)).filter(Boolean),
    position: part.position.map((value, index) => bounded(value, -5000, 5000, `part position ${index + 1}`)) as [number, number, number],
    rotationDeg: part.rotationDeg.map((value) => Math.max(-360, Math.min(360, value))) as [number, number, number],
  };
  if (!base.id || !base.name) throw new Error("CAD part id and name are required");
  if (part.primitiveType === "box") return { ...base, primitive: { type: "box", size: [bounded(part.sizeX, 0.1, 5000, `${part.name} sizeX`), bounded(part.sizeY, 0.1, 5000, `${part.name} sizeY`), bounded(part.sizeZ, 0.1, 5000, `${part.name} sizeZ`)] } };
  if (part.primitiveType === "cylinder") return { ...base, primitive: { type: "cylinder", radius: bounded(part.radius, 0.05, 2500, `${part.name} radius`), height: bounded(part.height, 0.1, 5000, `${part.name} height`), segments: Math.max(12, Math.min(96, Math.round(part.segments || 48))) } };
  if (part.primitiveType === "tube") return { ...base, primitive: { type: "tube", outerRadius: bounded(part.outerRadius, 0.1, 2500, `${part.name} outerRadius`), innerRadius: bounded(part.innerRadius, 0.05, 2499, `${part.name} innerRadius`), height: bounded(part.height, 0.1, 5000, `${part.name} height`), segments: Math.max(12, Math.min(96, Math.round(part.segments || 48))) } };
  if (part.primitiveType === "frustum") return { ...base, primitive: { type: "frustum", bottomRadius: bounded(part.bottomRadius, 0.05, 2500, `${part.name} bottomRadius`), topRadius: bounded(part.topRadius, 0.05, 2500, `${part.name} topRadius`), height: bounded(part.height, 0.1, 5000, `${part.name} height`), segments: Math.max(12, Math.min(96, Math.round(part.segments || 48))) } };
  if (part.primitiveType === "threadedCylinder") return { ...base, primitive: { type: "threadedCylinder", radius: bounded(part.radius, 0.5, 2500, `${part.name} base radius`), height: bounded(part.height, 1, 5000, `${part.name} height`), pitch: bounded(part.pitch, 0.25, 250, `${part.name} thread pitch`), threadDepth: bounded(part.threadDepth, 0.05, 100, `${part.name} thread depth`), segments: Math.max(16, Math.min(96, Math.round(part.segments || 48))) } };
  if (!Array.isArray(part.polygonPoints) || part.polygonPoints.length < 3 || part.polygonPoints.length > 32) throw new Error(`${part.name} requires 3–32 convex polygon points`);
  const points = part.polygonPoints.map(([x, y], index) => [bounded(x, -2500, 2500, `${part.name} polygon point ${index + 1} x`), bounded(y, -2500, 2500, `${part.name} polygon point ${index + 1} y`)] as Vec2);
  return { ...base, primitive: { type: "extrudedConvexPolygon", points, height: bounded(part.height, 0.1, 5000, `${part.name} height`) } };
}

function toAssemblySpec(model: ModelCadSpec): CadAssemblySpec {
  if (!Array.isArray(model.parts) || model.parts.length < 1 || model.parts.length > 24) throw new Error("Native CAD requires 1–24 supported parts per generation pass");
  return { name: model.assemblyName.trim().slice(0, 180) || "InventSmith Product", units: "mm", revision: model.revision.trim().slice(0, 40) || "A", assumptions: model.assumptions.slice(0, 40).map((item) => item.slice(0, 1000)), unresolvedEngineering: model.unresolvedEngineering.slice(0, 40).map((item) => item.slice(0, 1000)), parts: model.parts.map(toPart) };
}

async function storeText(ctx: any, content: string, mediaType: string): Promise<Id<"_storage">> { return await ctx.storage.store(new Blob([content], { type: mediaType })); }

export const generateNativeCad = internalAction({
  args: { inventionId: v.id("inventions"), workItemId: v.id("atlasWorkItems") },
  handler: async (ctx, args) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY is not configured for native CAD specification generation");
      const context = await ctx.runQuery(getNativeCadContext, args);
      const client = new OpenAI({ apiKey });
      const response = await client.responses.create({
        model: process.env.ATLAS_OPENAI_MODEL ?? "gpt-5.4-mini",
        max_output_tokens: 7000,
        reasoning: { effort: "medium" },
        input: [
          { role: "system", content: "You are the InventSmith CAD planning engine. Convert the evidence-backed selected product design into a conservative preliminary parametric assembly using the supported deterministic geometry: box, cylinder, hollow tube, tapered circular frustum, helical externally threaded cylinder, and extrusion of a CONVEX 2D polygon. Use millimeters. Prefer geometry that preserves the selected mechanism, patent-design differentiation constraints, interfaces, assembly intent, sealing intent, and manufacturability rather than reducing every product to generic boxes and cylinders. For every part, preserve the best-supported material, finish intent, target manufacturing process, and concise interface/mating notes from the selected design and engineering/manufacturing specifications. If any of those fields are unknown, say TBD or provisional rather than inventing certainty. Use threadedCylinder for screw-driven shafts, threaded plungers, twist-lift actuation, or other external helical interfaces when the selected mechanism requires them; thread pitch and depth remain provisional unless supported by engineering evidence. Use frustums for tapered rotational forms and extrudedConvexPolygon for non-circular prismatic custom outlines. For geometry fields not used by a selected primitive, return harmless numeric defaults and an empty polygonPoints array. Never invent a critical dimension as if verified. When evidence does not support a dimension, pitch, clearance, seal interface, finish requirement, manufacturing process, or tolerance, choose a clearly provisional value where geometry requires one and record the uncertainty in assumptions, interfaceNotes, and unresolvedEngineering. Avoid impossible overlaps when practical. This output is deterministically converted into real STEP/STL/DXF artifacts and engineering views and remains Preliminary CAD requiring engineering/prototype review before manufacturing release." },
          { role: "user", content: JSON.stringify({ invention: { title: context.invention.title, problemStatement: context.invention.problemStatement, targetAudience: context.invention.targetAudience, solutionDescription: context.invention.solutionDescription }, structuredRecord: context.structuredBrief, currentDesignArtifacts: context.deliverables, currentEvidenceFindings: context.findings, supportedGeometry: { units: "mm", primitives: { box: "sizeX/sizeY/sizeZ", cylinder: "radius/height", tube: "outerRadius/innerRadius/height", frustum: "bottomRadius/topRadius/height", threadedCylinder: "radius/height/pitch/threadDepth; external helical thread", extrudedConvexPolygon: "polygonPoints[[x,y],...]/height; convex profiles only" }, partMetadata: { material: "best-supported material or provisional/TBD", finish: "finish intent or provisional/TBD", manufacturingProcess: "target process or provisional/TBD", interfaceNotes: "mating, sealing, assembly, clearance, service, or unresolved-interface notes" }, maxParts: 24 } }) },
        ],
        text: { format: { type: "json_schema", name: "inventsmith_native_cad_spec", strict: true, schema: cadSpecSchema } },
      });

      const spec = toAssemblySpec(JSON.parse(response.output_text) as ModelCadSpec);
      const generated = generateCadArtifacts(spec);
      const orthographicSvg = generateOrthographicDrawing(spec);
      const explodedSvg = generateExplodedDrawing(spec);
      const [stepStorageId, stlStorageId, dxfStorageId, sourceStorageId, orthographicStorageId, explodedStorageId] = await Promise.all([
        storeText(ctx, generated.step, "model/step"), storeText(ctx, generated.stl, "model/stl"), storeText(ctx, generated.dxf, "application/dxf"), storeText(ctx, generated.sourceJson, "application/json"), storeText(ctx, orthographicSvg, "image/svg+xml"), storeText(ctx, explodedSvg, "image/svg+xml"),
      ]);
      const actualCostUnits = costUnitsFromTokens(response.usage?.total_tokens);
      const result = await ctx.runMutation(recordNativeCadSuccess, {
        inventionId: args.inventionId,
        workItemId: args.workItemId,
        artifacts: [
          { kind: "native_cad_step", title: `${spec.name} — STEP CAD`, storageId: stepStorageId, mediaType: "model/step" },
          { kind: "native_cad_stl", title: `${spec.name} — STL prototype mesh`, storageId: stlStorageId, mediaType: "model/stl" },
          { kind: "native_cad_dxf", title: `${spec.name} — DXF 3D face geometry`, storageId: dxfStorageId, mediaType: "application/dxf" },
          { kind: "native_cad_source", title: `${spec.name} — editable InventSmith CAD source`, storageId: sourceStorageId, mediaType: "application/json" },
          { kind: "cad_orthographic_views", title: `${spec.name} — orthographic engineering views`, storageId: orthographicStorageId, mediaType: "image/svg+xml" },
          { kind: "cad_exploded_view", title: `${spec.name} — exploded assembly view`, storageId: explodedStorageId, mediaType: "image/svg+xml" },
        ],
        sourceSpec: spec,
        triangleCount: generated.triangleCount,
        partCount: generated.partCount,
        assumptions: spec.assumptions,
        unresolvedEngineering: spec.unresolvedEngineering,
        actualCostUnits,
        completedAt: Date.now(),
      });
      return { ...result, failed: false, actualCostUnits };
    } catch (error) {
      const failure = await ctx.runMutation(recordNativeCadFailure, { inventionId: args.inventionId, workItemId: args.workItemId, error: error instanceof Error ? error.message : "Native CAD generation failed", failedAt: Date.now() });
      return { discarded: false, failed: true, willRetry: failure.willRetry, actualCostUnits: 0 };
    }
  },
});