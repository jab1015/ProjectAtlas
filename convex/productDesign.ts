import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { canTierRunWorkKind } from "./entitlementPolicyLogic";
import { requireInventionEditAccess, requireInventionReadAccess } from "./organizations";
import { resolveInventionUsageScope } from "./organizationUsageScope";

export const DESIGN_WORK = [
  {
    kind: "design_candidate_generation",
    title: "Generate evidence-backed product design candidates",
    priority: 69,
    estimatedCostUnits: 18,
    deliverableKind: "product_design_candidates",
    dependsOnKinds: ["patent_design_handoff", "design_directions", "product_requirements"],
    instructions: "Generate at least three materially different product design candidates. Treat the completed patent-to-design handoff as an explicit design constraint package: consume its crowded-feature warnings, distinguishing-feature hypotheses, alternative embodiments, unresolved legal questions, and source uncertainty. Use validation evidence, user needs, prior art, product requirements, materials/manufacturing constraints, cost evidence, and regulatory/safety questions. Describe form, mechanism, parts, user interaction, materials, assembly, manufacturing process, differentiation rationale, risks, and unresolved engineering questions for each candidate. Do not claim patentability or freedom to operate; optimize for meaningful structural and functional differentiation subject to later patent-professional review.",
  },
  {
    kind: "design_candidate_scoring",
    title: "Score and select the strongest product design direction",
    priority: 68,
    estimatedCostUnits: 14,
    deliverableKind: "design_candidate_scorecard",
    dependsOnKinds: ["design_candidate_generation", "preliminary_bom_cost"],
    instructions: "Score the candidate designs using explicit evidence-backed criteria: user fit, differentiation from identified prior-art constraints, technical feasibility, manufacturability, estimated cost, maintainability, safety/regulatory risk, prototype complexity, and commercial potential. Penalize candidates that recreate crowded mechanisms or ignore the patent-to-design handoff. Explain weights, uncertainty, tradeoffs, and why the recommended candidate is strongest. Do not claim a statistically proven probability of market success or patentability.",
  },
  {
    kind: "product_design_specification",
    title: "Create the selected Product Design Specification",
    priority: 67,
    estimatedCostUnits: 18,
    deliverableKind: "product_design_specification",
    dependsOnKinds: ["design_candidate_scoring"],
    instructions: "Turn the selected candidate into a detailed Product Design Specification covering functional requirements, physical architecture, dimensions that are known versus TBD, components, interfaces, materials, mechanisms, ergonomics, assembly, serviceability, manufacturing assumptions, acceptance criteria, risks, patent-design constraints carried forward, and open engineering decisions. Preserve a clear boundary between preliminary design decisions and engineering-reviewed or patent-professional-reviewed values.",
  },
  {
    kind: "cad_model_specification",
    title: "Prepare the parametric CAD model specification",
    priority: 66,
    estimatedCostUnits: 14,
    deliverableKind: "cad_model_specification",
    dependsOnKinds: ["product_design_specification"],
    instructions: "Prepare a CAD-authoring specification for the selected product. Define assemblies, individual parts, datums, coordinate conventions, parametric variables, configurable dimensions, interfaces, mates/joints, material assignments, target manufacturing process, file outputs required (STEP/STL/DXF as appropriate), revision metadata, and every dimension/tolerance that remains unresolved. Preserve the selected design's documented differentiation constraints. This specification is an input to the CAD generator and must not pretend that CAD files already exist or are manufacturing-released.",
  },
  {
    kind: "exploded_view_specification",
    title: "Prepare the assembly and exploded-view specification",
    priority: 65,
    estimatedCostUnits: 10,
    deliverableKind: "exploded_view_specification",
    dependsOnKinds: ["cad_model_specification"],
    instructions: "Define the exploded-view sequence and assembly narrative for the selected design: every part, fastener, interface, assembly direction, subassembly, serviceable component, callout, and BOM relationship. Identify which views will be needed for inventor review, manufacturer RFQ, engineering review, patent-professional review, and pitch materials.",
  },
  {
    kind: "manufacturing_drawing_specification",
    title: "Prepare the manufacturing drawing requirements",
    priority: 64,
    estimatedCostUnits: 12,
    deliverableKind: "manufacturing_drawing_specification",
    dependsOnKinds: ["cad_model_specification", "exploded_view_specification"],
    instructions: "Prepare a drawing-release checklist for every part and assembly. Specify required orthographic/section/detail views, dimensions, GD&T or tolerances only where justified, materials, finishes, fasteners, notes, inspection criteria, revision controls, and professional engineering decisions still required before Manufacturing Released maturity.",
  },
  {
    kind: "product_render_generation",
    title: "Generate polished 3D product presentation renders",
    priority: 62,
    estimatedCostUnits: 30,
    deliverableKind: "product_render_board",
    dependsOnKinds: ["native_cad_generation", "product_design_specification", "exploded_view_specification"],
    instructions: "Generate an image prompt for a polished product-render board based ONLY on the selected Product Design Specification, current preliminary CAD source/geometry, exploded-view specification, materials/finish intent, and patent-design differentiation constraints. The board should include a professional three-quarter hero rendering plus useful complementary product/detail or assembly views suitable for inventor review, manufacturer communication, and pitch materials. Preserve the selected mechanism and part relationships. Do not invent features, dimensions, logos, certifications, patent claims, controls, materials, interfaces, or production details that are not in the design record. Put the exact complete image-generation direction in conceptImagePrompt. The result remains a presentation rendering of preliminary design state, not engineering approval or manufacturing release.",
  },
] as const;

export const ensureProductDesignWorkspace = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    await requireInventionEditAccess(ctx, args.inventionId);
    const usageScope = await resolveInventionUsageScope(ctx, args.inventionId);
    if (!usageScope) throw new ConvexError("Invention not found");
    if (!canTierRunWorkKind(usageScope.plan, "design_candidate_generation")) {
      throw new ConvexError("Product Design requires a Pro or higher entitlement");
    }

    const existing = await ctx.db
      .query("atlasWorkItems")
      .withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId))
      .collect();
    const existingKinds = new Set(existing.map((item: any) => item.kind));
    const now = Date.now();
    let created = 0;

    for (const item of DESIGN_WORK) {
      if (existingKinds.has(item.kind)) continue;
      await ctx.db.insert("atlasWorkItems", {
        inventionId: args.inventionId,
        kind: item.kind,
        title: item.title,
        status: "queued",
        priority: item.priority,
        inputSnapshot: { department: "product_design", stageId: 5, instructions: item.instructions },
        attemptCount: 0,
        maxAttempts: 3,
        estimatedCostUnits: item.estimatedCostUnits,
        deliverableKind: item.deliverableKind,
        dependsOnKinds: [...item.dependsOnKinds],
        createdAt: now,
        updatedAt: now,
      });
      created += 1;
    }

    if (created > 0) {
      await ctx.db.insert("atlasExecutionEvents", {
        inventionId: args.inventionId,
        eventType: "work_queued",
        actorType: "system",
        summary: `InventSmith opened the Product Design department and queued ${created} design work items.`,
        metadata: { department: "product_design", created, requiredHandoff: "patent_design_handoff", usageScope: usageScope.scope },
        createdAt: now,
      });
    }

    return { created, total: DESIGN_WORK.length };
  },
});

export const getProductDesignWorkspace = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    await requireInventionReadAccess(ctx, args.inventionId);
    const invention = await ctx.db.get(args.inventionId);
    if (!invention) throw new ConvexError("Invention not found");
    const [workItems, deliverables, evidence] = await Promise.all([
      ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("evidenceSources").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect(),
    ]);

    const designKinds = new Set(DESIGN_WORK.map((item) => item.kind));
    const designDeliverableKinds = new Set(DESIGN_WORK.map((item) => item.deliverableKind));
    const relatedWorkKinds = new Set([
      "preliminary_prior_art",
      "feature_prior_art_comparison",
      "distinguishing_features",
      "patent_design_handoff",
      "product_requirements",
      "design_directions",
      "materials_manufacturing",
      "preliminary_bom_cost",
      "concept_image_generation",
      "native_cad_generation",
      ...designKinds,
    ]);

    const designWork = workItems
      .filter((item: any) => relatedWorkKinds.has(item.kind))
      .sort((a: any, b: any) => b.priority - a.priority || a.createdAt - b.createdAt);
    const designDeliverables = deliverables
      .filter((item: any) => designDeliverableKinds.has(item.kind) || relatedWorkKinds.has(item.kind) || ["native_cad_step", "native_cad_stl", "native_cad_dxf", "native_cad_source", "cad_orthographic_views", "cad_exploded_view"].includes(item.kind))
      .sort((a: any, b: any) => b.updatedAt - a.updatedAt);
    const handoffWork = workItems.find((item: any) => item.kind === "patent_design_handoff");
    const handoffDeliverable = deliverables
      .filter((item: any) => item.kind === "patent_design_handoff")
      .sort((a: any, b: any) => b.updatedAt - a.updatedAt)[0];

    return {
      invention: { _id: invention._id, title: invention.title },
      initialized: designKinds.size > 0 && [...designKinds].every((kind) => workItems.some((item: any) => item.kind === kind)),
      patentDesignHandoff: {
        status: handoffWork?.status ?? "not_queued",
        completed: handoffWork?.status === "completed",
        deliverableId: handoffDeliverable?._id ?? null,
        trustState: handoffDeliverable?.trustState ?? null,
        updatedAt: handoffDeliverable?.updatedAt ?? handoffWork?.updatedAt ?? null,
      },
      workItems: designWork,
      deliverables: await Promise.all(designDeliverables.map(async (deliverable: any) => ({
        ...deliverable,
        mediaUrl: deliverable.storageId && deliverable.mediaType?.startsWith("image/") ? await ctx.storage.getUrl(deliverable.storageId) : null,
      }))),
      evidenceCount: evidence.length,
      inventorEvidenceCount: evidence.filter((item: any) => item.metadata?.provenance === "inventor_upload").length,
      cadStatus: {
        specificationReady: deliverables.some((item: any) => item.kind === "cad_model_specification" && !item.staleReason),
        nativeCadFilesGenerated: deliverables.some((item: any) => ["model/step", "model/stl", "application/dxf"].includes(item.mediaType ?? "")),
      },
    };
  },
});