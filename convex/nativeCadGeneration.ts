"use node";

import OpenAI from "openai";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { makeFunctionReference } from "convex/server";
import type { Id } from "./_generated/dataModel";
import { costUnitsFromTokens } from "./workOrchestratorLogic";
import { generateCadArtifacts, type CadAssemblySpec, type CadPartSpec } from "./cadGeometry";

const getNativeCadContext = makeFunctionReference<"query", { inventionId: Id<"inventions">; workItemId: Id<"atlasWorkItems"> }, any>("nativeCad:getNativeCadContext");
const recordNativeCadSuccess = makeFunctionReference<"mutation", any, { discarded: boolean }>("nativeCad:recordNativeCadSuccess");
const recordNativeCadFailure = makeFunctionReference<"mutation", { inventionId: Id<"inventions">; workItemId: Id<"atlasWorkItems">; error: string; failedAt: number }, void>("nativeCad:recordNativeCadFailure");

const vecSchema = { type: "array", minItems: 3, maxItems: 3, items: { type: "number" } } as const;

const cadSpecSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    assemblyName: { type: "string" },
    revision: { type: "string" },
    assumptions: { type: "array", items: { type: "string" } },
    unresolvedEngineering: { type: "array", items: { type: "string" } },
    parts: {
      type: "array",
      minItems: 1,
      maxItems: 24,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          material: { type: "string" },
          primitiveType: { type: "string", enum: ["box", "cylinder", "tube"] },
          sizeX: { type: "number" },
          sizeY: { type: "number" },
          sizeZ: { type: "number" },
          radius: { type: "number" },
          outerRadius: { type: "number" },
          innerRadius: { type: "number" },
          height: { type: "number" },
          segments: { type: "integer" },
          position: vecSchema,
          rotationDeg: vecSchema,
        },
        required: ["id", "name", "material", "primitiveType", "sizeX", "sizeY", "sizeZ", "radius", "outerRadius", "innerRadius", "height", "segments", "position", "rotationDeg"],
      },
    },
  },
  required: ["assemblyName", "revision", "assumptions", "unresolvedEngineering", "parts"],
} as const;

interface ModelPart {
  id: string;
  name: string;
  material: string;
  primitiveType: "box" | "cylinder" | "tube";
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  radius: number;
  outerRadius: number;
  innerRadius: number;
  height: number;
  segments: number;
  position: [number, number, number];
  rotationDeg: [number, number, number];
}

interface ModelCadSpec {
  assemblyName: string;
  revision: string;
  assumptions: string[];
  unresolvedEngineering: string[];
  parts: ModelPart[];
}

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
    position: part.position.map((value, index) => bounded(value, -5000, 5000, `part position ${index + 1}`)) as [number, number, number],
    rotationDeg: part.rotationDeg.map((value) => Math.max(-360, Math.min(360, value))) as [number, number, number],
  };
  if (!base.id || !base.name) throw new Error("CAD part id and name are required");

  if (part.primitiveType === "box") {
    return {
      ...base,
      primitive: {
        type: "box",
        size: [
          bounded(part.sizeX, 0.1, 5000, `${part.name} sizeX`),
          bounded(part.sizeY, 0.1, 5000, `${part.name} sizeY`),
          bounded(part.sizeZ, 0.1, 5000, `${part.name} sizeZ`),
        ],
      },
    };
  }
  if (part.primitiveType === "cylinder") {
    return {
      ...base,
      primitive: {
        type: "cylinder",
        radius: bounded(part.radius, 0.05, 2500, `${part.name} radius`),
        height: bounded(part.height, 0.1, 5000, `${part.name} height`),
        segments: Math.max(12, Math.min(96, Math.round(part.segments || 48))),
      },
    };
  }
  return {
    ...base,
    primitive: {
      type: "tube",
      outerRadius: bounded(part.outerRadius, 0.1, 2500, `${part.name} outerRadius`),
      innerRadius: bounded(part.innerRadius, 0.05, 2499, `${part.name} innerRadius`),
      height: bounded(part.height, 0.1, 5000, `${part.name} height`),
      segments: Math.max(12, Math.min(96, Math.round(part.segments || 48))),
    },
  };
}

function toAssemblySpec(model: ModelCadSpec): CadAssemblySpec {
  if (!Array.isArray(model.parts) || model.parts.length < 1 || model.parts.length > 24) throw new Error("Native CAD requires 1–24 supported parts per generation pass");
  return {
    name: model.assemblyName.trim().slice(0, 180) || "InventSmith Product",
    units: "mm",
    revision: model.revision.trim().slice(0, 40) || "A",
    assumptions: model.assumptions.slice(0, 40).map((item) => item.slice(0, 1000)),
    unresolvedEngineering: model.unresolvedEngineering.slice(0, 40).map((item) => item.slice(0, 1000)),
    parts: model.parts.map(toPart),
  };
}

async function storeText(ctx: any, content: string, mediaType: string): Promise<Id<"_storage">> {
  return await ctx.storage.store(new Blob([content], { type: mediaType }));
}

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
        max_output_tokens: 6000,
        reasoning: { effort: "medium" },
        input: [
          {
            role: "system",
            content: "You are the InventSmith CAD planning engine. Convert the evidence-backed selected product design into a conservative preliminary parametric assembly using ONLY supported primitives: boxes, cylinders, and hollow tubes. Use millimeters. Preserve the product's mechanism and assembly intent as closely as supported, but never invent a critical dimension as if it were verified. When a dimension is not supported by evidence, choose a clearly provisional value and record it in assumptions and unresolvedEngineering. Avoid impossible overlaps when practical. This output will be deterministically converted into real STEP/STL/DXF artifacts and will remain Preliminary CAD requiring engineering/prototype review before manufacturing release.",
          },
          {
            role: "user",
            content: JSON.stringify({
              invention: {
                title: context.invention.title,
                problemStatement: context.invention.problemStatement,
                targetAudience: context.invention.targetAudience,
                solutionDescription: context.invention.solutionDescription,
              },
              structuredRecord: context.structuredBrief,
              currentDesignArtifacts: context.deliverables,
              currentEvidenceFindings: context.findings,
              supportedGeometry: {
                units: "mm",
                primitives: {
                  box: "sizeX/sizeY/sizeZ",
                  cylinder: "radius/height",
                  tube: "outerRadius/innerRadius/height",
                },
                maxParts: 24,
              },
            }),
          },
        ],
        text: { format: { type: "json_schema", name: "inventsmith_native_cad_spec", strict: true, schema: cadSpecSchema } },
      });

      const modelSpec = JSON.parse(response.output_text) as ModelCadSpec;
      const spec = toAssemblySpec(modelSpec);
      const generated = generateCadArtifacts(spec);
      const [stepStorageId, stlStorageId, dxfStorageId, sourceStorageId] = await Promise.all([
        storeText(ctx, generated.step, "model/step"),
        storeText(ctx, generated.stl, "model/stl"),
        storeText(ctx, generated.dxf, "application/dxf"),
        storeText(ctx, generated.sourceJson, "application/json"),
      ]);
      const actualCostUnits = costUnitsFromTokens(response.usage?.total_tokens);
      const completedAt = Date.now();

      return await ctx.runMutation(recordNativeCadSuccess, {
        inventionId: args.inventionId,
        workItemId: args.workItemId,
        artifacts: [
          { kind: "native_cad_step", title: `${spec.name} — STEP CAD`, storageId: stepStorageId, mediaType: "model/step" },
          { kind: "native_cad_stl", title: `${spec.name} — STL prototype mesh`, storageId: stlStorageId, mediaType: "model/stl" },
          { kind: "native_cad_dxf", title: `${spec.name} — DXF 3D face geometry`, storageId: dxfStorageId, mediaType: "application/dxf" },
          { kind: "native_cad_source", title: `${spec.name} — editable InventSmith CAD source`, storageId: sourceStorageId, mediaType: "application/json" },
        ],
        sourceSpec: spec,
        triangleCount: generated.triangleCount,
        partCount: generated.partCount,
        assumptions: spec.assumptions,
        unresolvedEngineering: spec.unresolvedEngineering,
        actualCostUnits,
        completedAt,
      });
    } catch (error) {
      await ctx.runMutation(recordNativeCadFailure, {
        inventionId: args.inventionId,
        workItemId: args.workItemId,
        error: error instanceof Error ? error.message : "Native CAD generation failed",
        failedAt: Date.now(),
      });
      return { discarded: false, failed: true };
    }
  },
});
