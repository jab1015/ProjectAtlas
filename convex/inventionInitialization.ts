import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { buildInventionWorkPlan } from "./inventionWorkPlanLogic";
import { riskClassForClassification, type InventionClassification } from "./inventionClassificationLogic";

export interface InventionBriefInput {
  title: string;
  problemStatement?: string;
  targetAudience?: string;
  solutionDescription?: string;
}

export async function initializeClassifiedInvention(
  ctx: MutationCtx,
  inventionId: Id<"inventions">,
  userId: Id<"users">,
  brief: InventionBriefInput,
  classification: InventionClassification,
  now: number,
) {
  const plan = buildInventionWorkPlan(classification);

  await ctx.db.insert("inventionRecords", {
    inventionId,
    userId,
    schemaVersion: 1,
    lifecycleStatus: "intake",
    riskClass: riskClassForClassification(classification),
    structuredBrief: {
      ...brief,
      classification: {
        productType: classification.productType,
        supportClass: classification.supportClass,
        categories: classification.categories,
        professionalReviewAreas: classification.professionalReviewAreas,
      },
    },
    createdAt: now,
    updatedAt: now,
  });

  for (const item of plan.canonical) {
    const completed = item.initiallyCompleted === true;
    await ctx.db.insert("atlasWorkItems", {
      inventionId,
      kind: item.kind,
      title: item.title,
      status: completed ? "completed" : "queued",
      priority: item.priority,
      inputSnapshot: item.instructions
        ? { department: item.kind === "patent_design_handoff" ? "patent_readiness" : "canonical", instructions: item.instructions }
        : undefined,
      outputSummary: completed ? "InventSmith created the first structured record of the invention." : undefined,
      attemptCount: completed ? 1 : 0,
      maxAttempts: completed ? undefined : 3,
      estimatedCostUnits: item.estimatedCostUnits,
      deliverableKind: item.deliverableKind,
      dependsOnKinds: item.dependsOnKinds,
      createdAt: now,
      startedAt: completed ? now : undefined,
      completedAt: completed ? now : undefined,
      updatedAt: now,
    });
  }

  for (const item of plan.postCanonical) {
    await ctx.db.insert("atlasWorkItems", {
      inventionId,
      kind: item.kind,
      title: item.title,
      status: "queued",
      priority: item.priority,
      inputSnapshot: item.inputSnapshot,
      attemptCount: 0,
      maxAttempts: 3,
      estimatedCostUnits: item.estimatedCostUnits,
      deliverableKind: item.deliverableKind,
      dependsOnKinds: item.dependsOnKinds,
      createdAt: now,
      updatedAt: now,
    });
  }

  await ctx.db.insert("atlasExecutionEvents", {
    inventionId,
    eventType: "work_queued",
    actorType: "system",
    summary: `InventSmith classified this as a ${classification.productType} invention and created its tailored idea-to-market work plan.`,
    metadata: {
      productType: classification.productType,
      supportClass: classification.supportClass,
      regulatedCategories: classification.categories,
      professionalReviewAreas: classification.professionalReviewAreas,
      canonicalWorkCount: plan.canonical.length,
      postCanonicalWorkCount: plan.postCanonical.length,
      totalWorkCount: plan.totalCount,
      includesNativeCad: plan.postCanonical.some((item) => item.kind === "native_cad_generation"),
      includesSoftwareArchitecture: plan.postCanonical.some((item) => item.kind === "software_architecture"),
    },
    createdAt: now,
  });

  return plan;
}
