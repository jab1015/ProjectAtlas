import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { normalizeAtlasTier } from "./usagePolicyLogic";

interface LifecycleWorkDefinition {
  kind: string;
  title: string;
  deliverableKind: string;
  priority: number;
  estimatedCostUnits: number;
  dependsOnKinds: string[];
  instructions: string;
  research?: boolean;
  professionalGate?: "patent" | "contracts" | "engineering" | "regulatory" | "finance" | "other";
}

interface LifecycleStageDefinition {
  id: number;
  name: string;
  description: string;
  work: LifecycleWorkDefinition[];
}

function work(
  kind: string,
  title: string,
  deliverableKind: string,
  priority: number,
  dependsOnKinds: string[],
  instructions: string,
  options: Partial<Pick<LifecycleWorkDefinition, "estimatedCostUnits" | "research" | "professionalGate">> = {}
): LifecycleWorkDefinition {
  return { kind, title, deliverableKind, priority, dependsOnKinds, instructions, estimatedCostUnits: options.estimatedCostUnits ?? 12, research: options.research, professionalGate: options.professionalGate };
}

export const lifecycleStages: LifecycleStageDefinition[] = [
  {
    id: 6,
    name: "Prototype",
    description: "Turn the selected product design into a physical-validation plan, capture prototype evidence, and feed what is learned back into design/CAD.",
    work: [
      work("prototype_strategy", "Choose the prototype strategy", "prototype_strategy", 62, ["product_design_specification"], "Choose the smallest useful prototype sequence: concept, looks-like, works-like, engineering, or mixed. Explain what each prototype must prove, which CAD revision it uses, likely fabrication methods, budget/time assumptions, and what can be learned before spending more."),
      work("prototype_sourcing_plan", "Prepare prototype sourcing and fabrication plan", "prototype_sourcing_plan", 61, ["prototype_strategy", "native_cad_generation"], "Identify appropriate prototyping processes and provider types for each part: additive manufacturing, CNC, laser cutting, sheet fabrication, electronics/PCB, off-the-shelf components, fixtures, or specialist fabrication. Define RFQ inputs, expected lead-time/cost drivers, and selection criteria.", { research: true }),
      work("prototype_test_plan", "Create measurable prototype test plan", "prototype_test_plan", 60, ["prototype_strategy", "product_design_specification"], "Convert open design and engineering questions into measurable prototype tests with setup, procedure, measurement method, pass/fail criteria, sample count assumptions, safety precautions, evidence to upload, and decisions triggered by each result."),
      work("prototype_evidence_assessment", "Assess uploaded prototype evidence", "prototype_test_report", 59, ["prototype_test_plan"], "Review inventor-uploaded prototype photos, notes, measurements, videos/transcripts, failure observations, and professional input present in the invention record. Separate observed evidence from interpretation. Report passes, failures, anomalies, missing tests, and confidence.", { professionalGate: "engineering" }),
      work("prototype_design_gap_analysis", "Map prototype findings back to product design", "prototype_to_spec_gap_analysis", 58, ["prototype_evidence_assessment"], "Compare prototype evidence with the Product Design Specification and CAD assumptions. Identify required design changes, dimensional changes, material/process changes, unresolved root causes, and exactly which downstream design/CAD/BOM work must be refreshed."),
      work("prototype_readiness", "Determine prototype iteration readiness", "prototype_readiness_assessment", 57, ["prototype_design_gap_analysis"], "Recommend build another prototype, proceed to engineering review, or prepare for manufacturing quotation. State evidence, remaining uncertainty, required professional review, and next physical validation step."),
    ],
  },
  {
    id: 7,
    name: "Manufacturing",
    description: "Translate the validated design into a factory-ready sourcing, RFQ, cost, quality, and production plan without leaving a first-time inventor to guess what a manufacturer needs.",
    work: [
      work("manufacturing_process_plan", "Select candidate manufacturing processes", "manufacturing_process_plan", 56, ["product_design_specification", "preliminary_bom_cost"], "For each part and assembly, recommend candidate production processes and compare tooling, MOQ, tolerance capability, material compatibility, cosmetic quality, repeatability, automation, lead time, scale economics, and prototype-to-production changes.", { research: true }),
      work("factory_requirements", "Define the factory capability profile", "factory_requirements_profile", 55, ["manufacturing_process_plan"], "Define exactly what type of factory or contract manufacturer is appropriate, required process capabilities, certifications/quality systems to investigate, expected equipment, inspection capability, production volumes, geography tradeoffs, IP/confidentiality concerns, and disqualifying red flags."),
      work("manufacturer_sourcing", "Research candidate manufacturers and prototyping suppliers", "manufacturer_candidate_report", 54, ["factory_requirements"], "Research credible candidate manufacturers or sourcing channels matching the required processes, geography, volume, materials, and quality profile. Provide source URLs and evidence for fit, but do not contact or imply endorsement. Identify what must be verified before disclosure or purchase.", { research: true }),
      work("manufacturer_rfq_package", "Assemble manufacturer RFQ package", "manufacturer_rfq_package", 53, ["factory_requirements", "native_cad_generation", "manufacturing_drawing_specification"], "Prepare the manufacturer-facing RFQ package contents: revision-controlled CAD/drawings list, BOM, materials/finishes, quantities, tolerance questions, quality/test requirements, packaging expectations, tooling ownership questions, quote breakdown request, lead-time request, Incoterms/logistics questions, confidentiality prerequisites, and missing engineering items."),
      work("manufacturer_scorecard", "Create manufacturer qualification scorecard", "manufacturer_evaluation_scorecard", 52, ["manufacturer_sourcing", "manufacturer_rfq_package"], "Create a weighted scorecard for comparing factories on technical capability, quality evidence, communication, IP/confidentiality, tooling, MOQ, lead time, price completeness, logistics, financial/commercial risk, references, and audit needs."),
      work("manufacturing_unit_economics", "Build production unit economics", "manufacturing_unit_economics", 51, ["manufacturer_rfq_package", "preliminary_bom_cost"], "Model unit economics across low, pilot, and scale volumes using BOM, tooling amortization, labor/process, scrap/yield assumptions, packaging, freight, duties, inspection, warehousing, and contingency. Clearly separate actual quotes from estimates."),
      work("manufacturer_quote_comparison", "Compare uploaded manufacturer quotes", "manufacturer_quote_comparison", 50, ["manufacturer_scorecard", "manufacturing_unit_economics"], "Use inventor-uploaded quotes as evidence. Normalize scope, currency, quantities, tooling, payment terms, exclusions, lead times, shipping, quality/test assumptions, and hidden cost risk. Score comparable bids and identify questions that must be answered before selection."),
      work("manufacturing_agreement_checklist", "Prepare manufacturing agreement review checklist", "manufacturing_agreement_checklist", 49, ["manufacturer_quote_comparison"], "Prepare an attorney-review checklist covering IP ownership, tooling ownership, confidentiality, subcontracting, quality, inspection, change control, delivery, defects/remedies, warranty, payment, termination, governing law, dispute terms, audit rights, and document precedence. Do not present it as final legal advice.", { professionalGate: "contracts" }),
      work("manufacturing_readiness", "Assess manufacturing readiness", "manufacturing_readiness_assessment", 48, ["manufacturer_quote_comparison", "manufacturing_agreement_checklist"], "Determine whether the invention is ready for a pilot production commitment. Gate on engineering review, prototype evidence, production drawings/CAD maturity, quote completeness, quality plan, tooling, IP/legal review, capital, and unresolved risks."),
    ],
  },
  {
    id: 8,
    name: "Branding",
    description: "Create an evidence-backed product identity and positioning system tied to the actual customer, product, and competitive whitespace.",
    work: [
      work("brand_positioning", "Develop product brand positioning", "brand_positioning", 47, ["market_feasibility", "product_design_specification"], "Develop positioning from validated customer segments, competitive alternatives, product benefit, price/value hypotheses, and physical product character. Produce category, target customer, promise, reasons to believe, differentiation, personality, and positioning statement."),
      work("product_name_candidates", "Develop and evaluate product name candidates", "product_name_evaluation", 46, ["brand_positioning"], "Generate and score name candidates for memorability, pronunciation, category fit, differentiation, extensibility, adverse meanings, preliminary trademark collision risk, and domain/social practicality. Treat clearance as preliminary until attorney/official search review.", { research: true }),
      work("trademark_preliminary_screen", "Run preliminary trademark screen", "trademark_preliminary_screen", 45, ["product_name_candidates"], "Research obvious trademark conflicts for leading name candidates, likely classes, similar marks, and risk signals using official/authoritative sources where available. This is screening, not legal clearance or registrability advice.", { research: true, professionalGate: "patent" }),
      work("brand_identity_system", "Create brand identity system", "brand_identity_system", 44, ["brand_positioning", "product_name_candidates"], "Create the brand system: recommended name direction, voice, messaging pillars, visual direction, typography/color guidance, packaging/product presentation principles, do/don't examples, and consistency rules tied to customer evidence."),
      work("brand_asset_brief", "Prepare brand asset production brief", "brand_asset_production_brief", 43, ["brand_identity_system"], "Specify the production brief for logo, packaging, website, product photography/rendering, retailer/investor collateral, social profiles, and accessibility requirements. Identify which assets InventSmith can generate and which need professional design review."),
    ],
  },
  {
    id: 9,
    name: "Intellectual Property / Legal",
    description: "Prepare the inventor for competent legal action: IP protection, NDAs, assignments, manufacturing/licensing contracts, deadlines, and professional handoffs.",
    work: [
      work("ip_strategy_plan", "Develop IP protection strategy", "ip_strategy_plan", 42, ["ip_readiness", "product_design_specification"], "Synthesize prior-art work, design evolution, disclosure history, business strategy, manufacturing exposure, brand plans, and budget into options for provisional/utility/design patent, trademark, trade secret, copyright, contractual protection, or deliberate no-filing. Identify deadlines and questions for counsel.", { professionalGate: "patent" }),
      work("invention_disclosure_package", "Prepare attorney-ready invention disclosure", "invention_disclosure_package", 41, ["ip_strategy_plan", "product_design_specification"], "Prepare a structured disclosure for patent counsel: problem, embodiments, mechanisms, variants, drawings/CAD references, chronology, inventor contributions, known prior art, distinguishing hypotheses, public disclosures, testing evidence, and open legal questions. Do not draft claims as approved legal claims.", { professionalGate: "patent" }),
      work("nda_draft_package", "Prepare NDA draft and use guidance", "nda_draft_package", 40, ["ip_strategy_plan"], "Prepare a jurisdiction-neutral NDA working draft/checklist appropriate for discussion with manufacturers, contractors, collaborators, and evaluators. Flag mutual vs unilateral choices, confidential information definition, exclusions, term, permitted use, compelled disclosure, return/destruction, residuals risk, and attorney-review requirements.", { professionalGate: "contracts" }),
      work("contracting_package", "Prepare inventor contract checklist and draft set", "inventor_contracting_package", 39, ["nda_draft_package", "manufacturing_agreement_checklist"], "Prepare issue lists and working drafts/checklists for contractor IP assignment, independent contractor terms, manufacturing, licensing, collaboration, and confidentiality as applicable. Identify required facts, negotiation points, consequences, and attorney gates. Do not represent drafts as ready for signature without required review.", { professionalGate: "contracts" }),
      work("ip_status_tracker", "Create IP and legal status tracker", "ip_legal_status_tracker", 38, ["ip_strategy_plan"], "Create a living tracker for filings, trademarks, NDAs, assignments, licenses, public disclosures, professional engagements, deadlines, responsibilities, document versions, and authorized-use status."),
      work("professional_legal_handoff", "Prepare legal professional handoff", "legal_professional_handoff", 37, ["invention_disclosure_package", "contracting_package", "ip_status_tracker"], "Create a concise attorney handoff identifying work already completed, evidence and source links, decisions needed, documents attached, filing/deadline questions, contract issues, budget-sensitive alternatives, and the specific scope requiring qualified counsel.", { professionalGate: "patent" }),
    ],
  },
  {
    id: 10,
    name: "Pricing",
    description: "Convert real cost, value, validation, channel, and competitor evidence into a viable pricing and margin strategy.",
    work: [
      work("pricing_evidence", "Assemble pricing evidence", "pricing_evidence_report", 36, ["market_feasibility", "manufacturing_unit_economics"], "Assemble competitor pricing, willingness-to-pay evidence, customer-value evidence, manufacturing/fulfillment cost, channel margins, and positioning constraints. Separate observed prices/quotes from estimates."),
      work("pricing_strategy", "Build pricing strategy", "pricing_strategy", 35, ["pricing_evidence"], "Compare cost-plus floor, competitive benchmark, and value-based ceiling. Recommend price architecture and price points with explicit assumptions, margin, channel effects, customer segment differences, and testing plan."),
      work("break_even_analysis", "Calculate break-even and margin scenarios", "break_even_analysis", 34, ["pricing_strategy"], "Model gross margin, contribution margin, tooling/startup recovery, break-even units/revenue, wholesale/retail channel margins, discounts/returns, and sensitivity to cost and volume assumptions."),
      work("pricing_validation_plan", "Plan price validation", "pricing_validation_plan", 33, ["pricing_strategy", "break_even_analysis"], "Design the lowest-cost validation of price and willingness to pay using survey/conjoint concepts, landing/preorder tests, interviews, quote requests, or sales experiments appropriate to the product stage. Define evidence thresholds and ethical disclosure."),
    ],
  },
  {
    id: 11,
    name: "Marketing",
    description: "Build the go-to-market strategy and launch assets from the validated customer, positioning, product, price, and evidence record.",
    work: [
      work("marketing_messaging", "Build messaging architecture", "marketing_messaging_architecture", 32, ["brand_identity_system", "pricing_strategy"], "Create the messaging hierarchy: audience, problem, product promise, key benefit, reasons to believe, differentiation, proof/evidence, objections, claims constraints, and channel adaptations. Prevent unsupported product, legal, certification, or performance claims."),
      work("marketing_channel_strategy", "Select go-to-market channels", "marketing_channel_strategy", 31, ["marketing_messaging", "market_feasibility"], "Evaluate likely channels for each customer segment: search/content, social, influencer, PR, email, marketplace, retail, trade shows, partnerships, B2B outreach, or other relevant paths. Rank by evidence, cost, reach, conversion assumptions, and operational fit.", { research: true }),
      work("marketing_plan", "Create go-to-market marketing plan", "go_to_market_marketing_plan", 30, ["marketing_channel_strategy"], "Create launch-oriented marketing strategy with objectives, target segments, positioning, channels, budget scenarios, funnel assumptions, metrics, content themes, campaign sequence, owners, dependencies, and experiment/learning plan."),
      work("marketing_asset_package", "Draft core marketing assets", "core_marketing_asset_package", 29, ["marketing_messaging", "brand_identity_system"], "Draft product one-liner, elevator pitch, landing-page copy, product description, email launch sequence, social/profile copy, FAQs, proof-point copy, and creative briefs tied to the approved claims/evidence."),
      work("prelaunch_marketing_calendar", "Build pre-launch marketing calendar", "prelaunch_marketing_calendar", 28, ["marketing_plan", "marketing_asset_package"], "Build a dated 90/60/30/14/7-day and launch-week content/outreach calendar with prerequisites, assets, owners, budget gates, metrics, and contingency triggers."),
    ],
  },
  {
    id: 12,
    name: "Sales",
    description: "Turn customer intent into an executable sales process, channel plan, toolkit, funnel, and revenue forecast.",
    work: [
      work("sales_channel_strategy", "Define sales channel strategy", "sales_channel_strategy", 27, ["marketing_channel_strategy", "pricing_strategy"], "Choose primary/secondary sales channels, channel economics, retailer/distributor implications, direct-sales process, fulfillment requirements, conversion assumptions, and channel risks."),
      work("sales_toolkit", "Create sales toolkit", "sales_toolkit", 26, ["sales_channel_strategy", "marketing_messaging"], "Create a product one-pager, buyer FAQ, objection-handling guide, competitor comparison, proof/evidence references, wholesale/buyer talking points, demo outline, and claims guardrails."),
      work("sales_funnel_model", "Build sales funnel model", "sales_funnel_model", 25, ["sales_channel_strategy", "marketing_plan"], "Model awareness-to-purchase funnel by channel with documented reach, click/lead, qualification, conversion, order value, repeat/referral assumptions, capacity constraints, and sensitivity ranges."),
      work("sales_projection", "Build first-year sales projections", "first_year_sales_projection", 24, ["sales_funnel_model", "pricing_strategy", "manufacturing_unit_economics"], "Build conservative/base/upside 12-month sales projections tied to channel assumptions, price, inventory/lead time, conversion, seasonality, returns, and marketing capacity. Separate forecast from commitment."),
      work("post_purchase_experience", "Design post-purchase experience", "post_purchase_experience_plan", 23, ["sales_toolkit"], "Design order confirmation, onboarding/use guidance, support, warranty/returns communications, review request, referral/repeat purchase, issue escalation, safety notice handling, and feedback capture."),
    ],
  },
  {
    id: 13,
    name: "Funding",
    description: "Turn the complete invention record into an investor/grant/crowdfunding-ready funding package with defensible evidence and product visuals.",
    work: [
      work("funding_strategy", "Develop funding strategy", "funding_strategy", 22, ["sales_projection", "manufacturing_unit_economics"], "Match capital need, stage, milestones, ownership preferences, risk, traction, and use of proceeds to plausible funding paths: self-funding, grants, crowdfunding, angels, strategic partners, lenders, or venture capital. Explain fit and sequencing."),
      work("funding_source_research", "Research specific funding sources", "funding_source_report", 21, ["funding_strategy"], "Research specific relevant grant programs, crowdfunding paths, investor categories, strategic partners, lenders, accelerators, and public resources. Include evidence, eligibility/fit, deadlines where known, and what must be independently verified before applying or contacting.", { research: true }),
      work("financial_model", "Build three-year financial model", "financial_model", 20, ["sales_projection", "manufacturing_unit_economics", "marketing_plan"], "Build a three-year model with revenue, units, COGS, gross margin, marketing/sales spend, operating expenses, tooling/capital needs, working capital, cash flow, scenarios, assumptions, and funding runway."),
      work("pitch_deck_content", "Build investor pitch deck", "pitch_deck", 19, ["funding_strategy", "financial_model", "product_design_specification"], "Create a 10–12 slide investor-ready narrative using the accumulated evidence: purpose, problem, solution, product, renders/technical views to include, validation, market, competition, defensibility/IP status, business model, unit economics, go-to-market, team/needs, milestones, financials, ask/use of proceeds. Use real invention data, not placeholders."),
      work("investor_faq", "Prepare investor FAQ and diligence answers", "investor_faq", 18, ["pitch_deck_content", "financial_model"], "Prepare the most likely investor diligence questions and evidence-backed draft answers on validation, competition, IP, product/design, engineering risk, manufacturing, margins, channels, team gaps, capital, milestones, and downside risks."),
      work("funding_readiness", "Assess funding readiness", "funding_readiness_assessment", 17, ["pitch_deck_content", "investor_faq", "funding_source_research"], "Assess whether the package is ready for the chosen funding path. Identify unsupported claims, missing traction/evidence, legal/entity/securities questions, financial weaknesses, design/manufacturing gaps, and the next highest-leverage preparation step.", { professionalGate: "finance" }),
    ],
  },
  {
    id: 14,
    name: "Launch",
    description: "Coordinate the commercial launch across product, inventory, legal, marketing, sales, support, and feedback systems.",
    work: [
      work("launch_readiness", "Build launch readiness checklist", "launch_readiness_checklist", 16, ["manufacturing_readiness", "marketing_plan", "sales_projection"], "Build a cross-functional launch checklist spanning product release, manufacturing/inventory, QA, IP/legal claims, pricing, storefront/listings, payments, fulfillment, customer support, marketing assets, analytics, contingency stock, returns, and owners/deadlines."),
      work("launch_playbook", "Create launch execution playbook", "launch_day_playbook", 15, ["launch_readiness", "prelaunch_marketing_calendar"], "Create 30/14/7/1-day and launch-day execution sequence with channels, messages, inventory/operations checks, escalation points, monitoring metrics, owner responsibilities, and contingency actions."),
      work("customer_feedback_loop", "Design launch customer feedback loop", "launch_customer_feedback_loop", 14, ["post_purchase_experience", "launch_playbook"], "Define how first-customer feedback, support issues, reviews, returns, product defects, usage observations, analytics, and safety signals will be captured as evidence and routed back into design, manufacturing, marketing, and support decisions."),
      work("launch_performance", "Analyze launch performance evidence", "launch_performance_report", 13, ["customer_feedback_loop"], "Analyze uploaded actual launch/sales/analytics/customer evidence against plan. Separate observed results from model assumptions. Identify product, message, channel, conversion, operations, quality, or inventory deviations and recommend the top corrective actions."),
      work("post_launch_priorities", "Create post-launch priority list", "post_launch_priority_list", 12, ["launch_performance"], "Rank the most important post-launch fixes or growth opportunities by customer impact, revenue/margin impact, safety/quality risk, confidence, urgency, effort, and dependency. Route product issues back to design/prototype/manufacturing when appropriate."),
    ],
  },
  {
    id: 15,
    name: "Growth",
    description: "Use real post-launch evidence to improve product, economics, acquisition, retention, channels, and operations continuously.",
    work: [
      work("growth_audit", "Run 90-day growth audit", "growth_90_day_audit", 11, ["launch_performance", "post_launch_priorities"], "Audit actual revenue, unit economics, gross margin, conversion, acquisition cost, repeat/retention proxies, returns, reviews, customer feedback, inventory, channel performance, operational bottlenecks, and product issues versus assumptions."),
      work("growth_levers", "Identify highest-value growth levers", "growth_levers_analysis", 10, ["growth_audit"], "Rank product, conversion, retention, acquisition, pricing, channel, operations, cost, merchandising, referral, and expansion levers by evidence strength, expected impact, cost, time-to-learn, risk, and dependencies."),
      work("growth_roadmap", "Build 90-day growth roadmap", "growth_roadmap", 9, ["growth_levers"], "Create a 90-day evidence-driven plan with initiatives, owners, weekly milestones, experiment design, budget gates, success/failure thresholds, review cadence, and product/design feedback loops."),
      work("retention_system", "Design retention and referral system", "retention_referral_system", 8, ["growth_audit", "post_purchase_experience"], "Design post-purchase education, replenishment/repeat triggers where applicable, referral, loyalty, support-to-retention, review, win-back, and customer research loops consistent with product category and actual customer behavior."),
      work("growth_performance_reporting", "Create recurring growth performance framework", "monthly_growth_performance_framework", 7, ["growth_roadmap"], "Define the monthly operating report: actual versus target metrics, cohort/channel/product changes, unit economics, customer evidence, experiments, anomalies, product/quality issues, updated priorities, and decisions for the next cycle."),
    ],
  },
];

async function requireOwnedInvention(ctx: Parameters<typeof getAuthUserId>[0] & { db: any }, inventionId: Id<"inventions">) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Authentication required");
  const invention = await ctx.db.get(inventionId);
  if (!invention || invention.userId !== userId) throw new ConvexError("Invention not found or access denied");
  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError("Inventor profile not found");
  return { userId, invention, user };
}

function stageById(stageId: number): LifecycleStageDefinition {
  const stage = lifecycleStages.find((item) => item.id === stageId);
  if (!stage) throw new ConvexError("This InventSmith lifecycle department is not defined");
  return stage;
}

export const ensureLifecycleDepartment = mutation({
  args: { inventionId: v.id("inventions"), stageId: v.number() },
  handler: async (ctx, args) => {
    const stage = stageById(args.stageId);
    const { user } = await requireOwnedInvention(ctx, args.inventionId);
    const tier = normalizeAtlasTier(user.subscriptionTier);
    if (tier !== "pro" && tier !== "enterprise") throw new ConvexError(`${stage.name} requires a Pro or Enterprise entitlement`);

    const existing = await ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect();
    const kinds = new Set(existing.map((item: any) => item.kind));
    const now = Date.now();
    let created = 0;
    for (const item of stage.work) {
      if (kinds.has(item.kind)) continue;
      await ctx.db.insert("atlasWorkItems", {
        inventionId: args.inventionId,
        kind: item.kind,
        title: item.title,
        status: "queued",
        priority: item.priority,
        inputSnapshot: { departmentStageId: stage.id, department: stage.name, instructions: item.instructions, research: Boolean(item.research), professionalGate: item.professionalGate ?? null },
        attemptCount: 0,
        maxAttempts: 3,
        estimatedCostUnits: item.estimatedCostUnits,
        deliverableKind: item.deliverableKind,
        dependsOnKinds: item.dependsOnKinds,
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
        summary: `InventSmith opened Stage ${stage.id}: ${stage.name} and queued ${created} work items.`,
        metadata: { stageId: stage.id, stageName: stage.name, created },
        createdAt: now,
      });
    }
    return { created, total: stage.work.length, stageName: stage.name };
  },
});

export const getLifecycleDepartment = query({
  args: { inventionId: v.id("inventions"), stageId: v.number() },
  handler: async (ctx, args) => {
    const stage = stageById(args.stageId);
    const { invention } = await requireOwnedInvention(ctx, args.inventionId);
    const [workItems, deliverables, evidence] = await Promise.all([
      ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("evidenceSources").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect(),
    ]);
    const stageKinds = new Set(stage.work.map((item) => item.kind));
    const deliverableKinds = new Set(stage.work.map((item) => item.deliverableKind));
    return {
      stage: { id: stage.id, name: stage.name, description: stage.description, workCount: stage.work.length },
      invention: { _id: invention._id, title: invention.title },
      initialized: stage.work.every((definition) => workItems.some((item: any) => item.kind === definition.kind)),
      workItems: workItems.filter((item: any) => stageKinds.has(item.kind)).sort((a: any, b: any) => b.priority - a.priority),
      deliverables: deliverables.filter((item: any) => deliverableKinds.has(item.kind)).sort((a: any, b: any) => b.updatedAt - a.updatedAt),
      evidenceCount: evidence.length,
      inventorEvidenceCount: evidence.filter((item: any) => item.metadata?.provenance === "inventor_upload").length,
    };
  },
});
