import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    // InventSmith MVP fields
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    subscriptionTier: v.optional(
      v.union(
        v.literal("free"),
        v.literal("inventor"),
        v.literal("pro"),
        v.literal("enterprise"),
        // Legacy aliases remain schema-valid until existing rows are normalized.
        v.literal("explorer"),
        v.literal("starter"),
        v.literal("inventor_pro")
      )
    ),
    subscriptionStatus: v.optional(v.union(
      v.literal("trialing"), v.literal("active"), v.literal("past_due"), v.literal("canceled"),
      v.literal("unpaid"), v.literal("incomplete"), v.literal("paused")
    )),
    subscriptionId: v.optional(v.string()),
    billingCustomerId: v.optional(v.string()),
    subscriptionCurrentPeriodEnd: v.optional(v.number()),
    subscriptionUpdatedAt: v.optional(v.number()),
    personalOrganizationId: v.optional(v.id("organizations")),
    // Extension point: Inventor Twin
    inventorTwin: v.optional(v.null()),
  })
    .index("email", ["email"])
    .index("by_role", ["role"]),

  // ── InventSmith: Organization-native tenancy ───────────────────────────────
  organizations: defineTable({
    name: v.string(),
    kind: v.union(v.literal("personal"), v.literal("company"), v.literal("studio")),
    planKey: v.union(
      v.literal("explorer"),
      v.literal("inventor"),
      v.literal("pro"),
      v.literal("enterprise"),
      v.literal("studio_3"),
      v.literal("studio_6"),
      v.literal("studio_custom")
    ),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("closed")),
    createdByUserId: v.id("users"),
    billingCustomerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.union(
      v.literal("trialing"), v.literal("active"), v.literal("past_due"), v.literal("canceled"),
      v.literal("unpaid"), v.literal("incomplete"), v.literal("paused")
    )),
    subscriptionCurrentPeriodEnd: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdByUserId", ["createdByUserId"])
    .index("by_kind", ["kind"])
    .index("by_status", ["status"]),

  organizationMemberships: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer"),
      v.literal("professional")
    ),
    status: v.union(v.literal("active"), v.literal("invited"), v.literal("suspended"), v.literal("removed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_userId", ["userId"])
    .index("by_organizationId_userId", ["organizationId", "userId"])
    .index("by_userId_status", ["userId", "status"]),

  subscriptionEvents: defineTable({
    providerEventId: v.string(),
    customerEmail: v.string(),
    tier: v.union(v.literal("inventor"), v.literal("pro"), v.literal("enterprise")),
    status: v.union(
      v.literal("trialing"), v.literal("active"), v.literal("past_due"), v.literal("canceled"),
      v.literal("unpaid"), v.literal("incomplete"), v.literal("paused")
    ),
    subscriptionId: v.optional(v.string()),
    billingCustomerId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
    occurredAt: v.number(),
    appliedUserId: v.optional(v.id("users")),
    receivedAt: v.number(),
  })
    .index("by_providerEventId", ["providerEventId"])
    .index("by_customerEmail", ["customerEmail"]),

  privacyRequests: defineTable({
    userId: v.id("users"),
    requestType: v.union(v.literal("data_export"), v.literal("account_deletion")),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("declined")),
    requestedAt: v.number(),
    completedAt: v.optional(v.number()),
    resolutionNotes: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_status", ["status"]),

  // ── InventSmith: Inventions ────────────────────────────────────────────────────────
  inventions: defineTable({
    userId: v.id("users"),
    title: v.string(),
    problemStatement: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    solutionDescription: v.optional(v.string()),
    currentStageId: v.number(), // 1–15
    createdAt: v.number(),
    updatedAt: v.number(),
    status: v.union(v.literal("active"), v.literal("archived")),
    // Optional during migration; all new inventions should be organization-owned.
    organizationId: v.optional(v.id("organizations")),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_status", ["status"])
    .index("by_organizationId", ["organizationId"])
    .index("by_organizationId_status", ["organizationId", "status"]),

  inventionAccessGrants: defineTable({
    inventionId: v.id("inventions"),
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    access: v.union(v.literal("manage"), v.literal("edit"), v.literal("view"), v.literal("review")),
    grantedByUserId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_userId", ["userId"])
    .index("by_inventionId_userId", ["inventionId", "userId"])
    .index("by_organizationId_userId", ["organizationId", "userId"]),

  // Canonical structured memory for an invention. Chat and generated
  // deliverables read from this record instead of treating conversation
  // history as the source of truth.
  inventionRecords: defineTable({
    inventionId: v.id("inventions"),
    userId: v.id("users"),
    schemaVersion: v.number(),
    lifecycleStatus: v.union(
      v.literal("intake"),
      v.literal("researching"),
      v.literal("awaiting_decision"),
      v.literal("awaiting_review"),
      v.literal("ready"),
      v.literal("paused"),
      v.literal("closed")
    ),
    riskClass: v.union(
      v.literal("standard"),
      v.literal("restricted"),
      v.literal("professional_review_required")
    ),
    structuredBrief: v.optional(v.any()),
    currentRecommendation: v.optional(
      v.union(
        v.literal("proceed"),
        v.literal("proceed_with_changes"),
        v.literal("pause"),
        v.literal("do_not_invest_yet")
      )
    ),
    recommendationRationale: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_userId", ["userId"])
    .index("by_userId_lifecycleStatus", ["userId", "lifecycleStatus"]),

  evidenceSources: defineTable({
    inventionId: v.id("inventions"),
    sourceType: v.union(
      v.literal("inventor_statement"),
      v.literal("patent"),
      v.literal("patent_application"),
      v.literal("product"),
      v.literal("publication"),
      v.literal("regulation"),
      v.literal("standard"),
      v.literal("market_data"),
      v.literal("professional_input"),
      v.literal("other")
    ),
    title: v.string(),
    locator: v.optional(v.string()),
    publisher: v.optional(v.string()),
    jurisdiction: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    accessedAt: v.number(),
    excerpt: v.optional(v.string()),
    reliability: v.union(
      v.literal("primary"),
      v.literal("authoritative_secondary"),
      v.literal("secondary"),
      v.literal("unverified")
    ),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_inventionId_sourceType", ["inventionId", "sourceType"]),

  evidenceFindings: defineTable({
    inventionId: v.id("inventions"),
    statement: v.string(),
    kind: v.union(
      v.literal("sourced_fact"),
      v.literal("inventor_statement"),
      v.literal("estimate"),
      v.literal("ai_inference")
    ),
    confidence: v.number(),
    sourceIds: v.array(v.id("evidenceSources")),
    assumptions: v.array(v.string()),
    limitations: v.array(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("evidence_checked"),
      v.literal("disputed"),
      v.literal("stale")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_inventionId_status", ["inventionId", "status"]),

  inventionAssumptions: defineTable({
    inventionId: v.id("inventions"),
    statement: v.string(),
    impact: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    status: v.union(
      v.literal("untested"),
      v.literal("testing"),
      v.literal("supported"),
      v.literal("refuted"),
      v.literal("accepted_risk")
    ),
    evidenceFindingIds: v.array(v.id("evidenceFindings")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_inventionId_status", ["inventionId", "status"]),

  inventionDecisions: defineTable({
    inventionId: v.id("inventions"),
    title: v.string(),
    question: v.string(),
    options: v.array(v.any()),
    recommendedOptionKey: v.optional(v.string()),
    selectedOptionKey: v.optional(v.string()),
    rationale: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("superseded")
    ),
    decidedByUserId: v.optional(v.id("users")),
    decidedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_inventionId_status", ["inventionId", "status"]),

  approvalRequests: defineTable({
    inventionId: v.id("inventions"),
    decisionId: v.optional(v.id("inventionDecisions")),
    actionType: v.union(
      v.literal("share_confidential_information"),
      v.literal("contact_third_party"),
      v.literal("publish_or_disclose"),
      v.literal("purchase_or_fee"),
      v.literal("submit_or_file"),
      v.literal("external_use"),
      v.literal("other")
    ),
    summary: v.string(),
    consequences: v.array(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("denied"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    requestedAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolvedByUserId: v.optional(v.id("users")),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_inventionId_status", ["inventionId", "status"]),

  atlasWorkItems: defineTable({
    inventionId: v.id("inventions"),
    kind: v.string(),
    title: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("blocked"),
      v.literal("awaiting_approval"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled"),
      v.literal("stale")
    ),
    priority: v.number(),
    inputSnapshot: v.optional(v.any()),
    outputSummary: v.optional(v.string()),
    blockedReason: v.optional(v.string()),
    attemptCount: v.number(),
    estimatedCostUnits: v.optional(v.number()),
    reservedCostUnits: v.optional(v.number()),
    reservationDateKey: v.optional(v.string()),
    actualCostUnits: v.optional(v.number()),
    maxAttempts: v.optional(v.number()),
    claimedAt: v.optional(v.number()),
    leaseExpiresAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
    deliverableKind: v.optional(v.string()),
    dependsOnKinds: v.optional(v.array(v.string())),
    humanGateType: v.optional(
      v.union(
        v.literal("decision"),
        v.literal("authorization"),
        v.literal("private_information"),
        v.literal("professional_review"),
        v.literal("payment"),
        v.literal("physical_work")
      )
    ),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_inventionId_status", ["inventionId", "status"])
    .index("by_status_priority", ["status", "priority"]),

  atlasExecutionEvents: defineTable({
    inventionId: v.id("inventions"),
    workItemId: v.optional(v.id("atlasWorkItems")),
    eventType: v.union(
      v.literal("work_queued"),
      v.literal("work_claimed"),
      v.literal("work_completed"),
      v.literal("work_failed"),
      v.literal("work_blocked"),
      v.literal("inventor_input_received"),
      v.literal("approval_resolved"),
      v.literal("decision_resolved"),
      v.literal("chat_requested"),
      v.literal("chat_answered"),
      v.literal("chat_failed"),
      v.literal("invention_changed"),
      v.literal("professional_review_recorded")
    ),
    actorType: v.union(v.literal("atlas"), v.literal("inventor"), v.literal("system")),
    summary: v.string(),
    attemptNumber: v.optional(v.number()),
    costUnits: v.optional(v.number()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_workItemId", ["workItemId"])
    .index("by_inventionId_createdAt", ["inventionId", "createdAt"]),

  atlasDailyUsage: defineTable({
    userId: v.id("users"),
    dateKey: v.string(),
    autonomousCostUnits: v.number(),
    reservedAutonomousCostUnits: v.optional(v.number()),
    completedWorkItems: v.number(),
    chatQuestions: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_dateKey", ["userId", "dateKey"]),

  // Additive organization-native usage ledger. Legacy user rows remain intact
  // for inventions that have not yet been migrated to an organization.
  organizationDailyUsage: defineTable({
    organizationId: v.id("organizations"),
    dateKey: v.string(),
    autonomousCostUnits: v.number(),
    reservedAutonomousCostUnits: v.optional(v.number()),
    completedWorkItems: v.number(),
    chatQuestions: v.number(),
    legacyBaselineCapturedAt: v.optional(v.number()),
    legacyMemberCount: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_organizationId_dateKey", ["organizationId", "dateKey"]),

  atlasDeliverables: defineTable({
    inventionId: v.id("inventions"),
    workItemId: v.optional(v.id("atlasWorkItems")),
    kind: v.string(),
    title: v.string(),
    version: v.number(),
    trustState: v.union(
      v.literal("atlas_draft"),
      v.literal("evidence_checked"),
      v.literal("inventor_approved"),
      v.literal("professional_review_required"),
      v.literal("professionally_reviewed"),
      v.literal("ready_for_authorized_use")
    ),
    content: v.optional(v.any()),
    storageId: v.optional(v.id("_storage")),
    mediaType: v.optional(v.string()),
    artifactMaturity: v.optional(
      v.union(
        v.literal("concept_visualization"),
        v.literal("preliminary_cad"),
        v.literal("prototype_candidate"),
        v.literal("engineering_reviewed"),
        v.literal("manufacturing_released")
      )
    ),
    generationPrompt: v.optional(v.string()),
    sourceIds: v.array(v.id("evidenceSources")),
    assumptions: v.array(v.string()),
    limitations: v.array(v.string()),
    sourceCoverage: v.optional(v.number()),
    confidence: v.optional(v.number()),
    searchDate: v.optional(v.number()),
    missingInformation: v.optional(v.array(v.string())),
    staleReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_inventionId_kind", ["inventionId", "kind"])
    .index("by_inventionId_trustState", ["inventionId", "trustState"]),

  deliverableDependencies: defineTable({
    inventionId: v.id("inventions"),
    deliverableId: v.id("atlasDeliverables"),
    dependencyType: v.union(
      v.literal("decision"),
      v.literal("finding"),
      v.literal("assumption"),
      v.literal("deliverable")
    ),
    dependencyId: v.string(),
    createdAt: v.number(),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_deliverableId", ["deliverableId"])
    .index("by_dependency", ["dependencyType", "dependencyId"]),

  professionalReviews: defineTable({
    inventionId: v.id("inventions"),
    deliverableId: v.id("atlasDeliverables"),
    specialty: v.union(
      v.literal("patent"),
      v.literal("contracts"),
      v.literal("engineering"),
      v.literal("regulatory"),
      v.literal("finance"),
      v.literal("other")
    ),
    requiredCredentials: v.string(),
    scope: v.string(),
    status: v.union(
      v.literal("required"),
      v.literal("requested"),
      v.literal("in_review"),
      v.literal("changes_requested"),
      v.literal("accepted"),
      v.literal("declined")
    ),
    reviewerName: v.optional(v.string()),
    reviewerReference: v.optional(v.string()),
    notes: v.optional(v.string()),
    requestedAt: v.optional(v.number()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_deliverableId", ["deliverableId"])
    .index("by_inventionId_status", ["inventionId", "status"]),

  // ── InventSmith: Stage Progress ────────────────────────────────────────────────────
  stageProgress: defineTable({
    inventionId: v.id("inventions"),
    stageId: v.number(),
    readinessScore: v.number(), // 0–100 (internal only, never shown to user)
    completedFields: v.array(v.string()),
    completedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_inventionId_stageId", ["inventionId", "stageId"]),

  // ── Extension point: AI conversation interface ────────────────────────────────
  // conversations table stub — no UI in MVP
  conversations: defineTable({
    inventionId: v.id("inventions"),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_inventionId", ["inventionId"]),

  conversationMessages: defineTable({
    conversationId: v.id("conversations"),
    inventionId: v.id("inventions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    status: v.union(v.literal("pending"), v.literal("complete"), v.literal("failed")),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_inventionId", ["inventionId"]),

  // ── Extension point: Document upload / file storage ────────────────────────
  documents: defineTable({
    inventionId: v.id("inventions"),
    userId: v.id("users"),
    fileName: v.string(),
    storageId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_inventionId", ["inventionId"]),

  // ── InventSmith: Validation Research ──────────────────────────────────────────────
  // Stores InventSmith-generated validation research results for each invention.
  // Keyed by inventionId. Multiple rows may exist (one per run); queries return
  // the most recent by startedAt / triggeredAt.
  validationResearch: defineTable({
    inventionId: v.id("inventions"),
    // ── Phase 1A spec fields ────────────────────────────────────────────────
    stageId: v.optional(v.string()),
    researchStatus: v.optional(v.string()), // "pending"|"running"|"completed"|"failed"|"stale"
    // sections is a keyed map: Record<sectionKey, SectionEntry>.
    // Stored as v.any() to allow the provider-independent mutation layer to
    // merge individual section entries without a full schema migration when
    // new section types are added. See validationResearchTypes.ts for the
    // canonical TypeScript shape.
    sections: v.optional(v.any()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    lastRefreshAt: v.optional(v.number()),
    providerVersion: v.optional(v.string()),
    researchVersion: v.optional(v.number()),
    // ── Progress tracking fields (Phase 1C-3) ───────────────────────────────
    // Set at session start; incremented by the orchestrator as each section lands.
    overallStatus: v.optional(v.string()), // "PENDING"|"IN_PROGRESS"|"COMPLETED"|"FAILED"
    completedSectionCount: v.optional(v.number()),
    totalSectionCount: v.optional(v.number()),
    lastCompletedSection: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
    // ── Legacy fields (backward-compatible with Phase 1 mutations) ──────────
    researchRunId: v.optional(v.string()),
    triggeredAt: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("running"),
        v.literal("complete"),
        v.literal("failed")
      )
    ),
    // Serialised sections JSON (legacy — new code uses the `sections` array)
    sectionsJson: v.optional(v.string()),
    error: v.optional(v.string()),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_stageId", ["stageId"])
    .index("by_researchStatus", ["researchStatus"])
    .index("by_inventionId_status", ["inventionId", "researchStatus"]),

  // ── Extension point: Notifications ───────────────────────────────────────────
  notifications: defineTable({
    userId: v.id("users"),
    inventionId: v.optional(v.id("inventions")),
    type: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ── Legacy digital-downloads tables (kept intact) ────────────────────────────
  products: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    priceAmountCents: v.number(),
    currency: v.string(),
    compareAtPriceCents: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    coverImageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    platformProductId: v.optional(v.string()),
    checkoutUrl: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("archived")
    ),
    featured: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    formatInfo: v.optional(v.string()),
    fileSize: v.optional(v.string()),
    totalSales: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_categoryId", ["categoryId"])
    .index("by_featured", ["featured"])
    .index("by_status_sortOrder", ["status", "sortOrder"])
    .index("by_platformProductId", ["platformProductId"]),

  productFiles: defineTable({
    productId: v.id("products"),
    displayName: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_productId", ["productId"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    productCount: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_sortOrder", ["sortOrder"]),

  purchases: defineTable({
    productId: v.id("products"),
    customerEmail: v.string(),
    customerName: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    platformOrderId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    amountCents: v.number(),
    currency: v.string(),
    downloadToken: v.string(),
    downloadCount: v.number(),
    lastDownloadedAt: v.optional(v.number()),
    fulfillmentStatus: v.union(
      v.literal("pending"),
      v.literal("fulfilled"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  })
    .index("by_customerEmail", ["customerEmail"])
    .index("by_productId", ["productId"])
    .index("by_userId", ["userId"])
    .index("by_downloadToken", ["downloadToken"])
    .index("by_platformOrderId", ["platformOrderId"])
    .index("by_stripeCheckoutSessionId", ["stripeCheckoutSessionId"]),

  testimonials: defineTable({
    productId: v.optional(v.id("products")),
    customerName: v.string(),
    customerTitle: v.optional(v.string()),
    quote: v.string(),
    rating: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_productId", ["productId"])
    .index("by_featured", ["featured"]),

  faqEntries: defineTable({
    productId: v.optional(v.id("products")),
    question: v.string(),
    answer: v.string(),
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_productId", ["productId"]),
});