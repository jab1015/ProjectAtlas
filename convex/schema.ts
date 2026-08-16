import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.string()),
    subscriptionTier: v.optional(v.union(v.literal("inventor"), v.literal("pro"), v.literal("enterprise"))),
    subscriptionStatus: v.optional(v.union(
      v.literal("trialing"), v.literal("active"), v.literal("past_due"), v.literal("canceled"),
      v.literal("unpaid"), v.literal("incomplete"), v.literal("paused")
    )),
    subscriptionId: v.optional(v.string()),
    billingCustomerId: v.optional(v.string()),
    subscriptionCurrentPeriodEnd: v.optional(v.number()),
    subscriptionUpdatedAt: v.optional(v.number()),
  }).index("email", ["email"]),

  organizations: defineTable({
    name: v.string(),
    kind: v.union(v.literal("personal"), v.literal("company"), v.literal("studio")),
    createdByUserId: v.id("users"),
    ownerUserId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("deleted")),
    planKey: v.union(
      v.literal("explorer"),
      v.literal("inventor"),
      v.literal("pro"),
      v.literal("enterprise"),
      v.literal("studio_3"),
      v.literal("studio_6"),
      v.literal("studio_custom")
    ),
    billingCustomerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.union(
      v.literal("trialing"), v.literal("active"), v.literal("past_due"), v.literal("canceled"),
      v.literal("unpaid"), v.literal("incomplete"), v.literal("paused")
    )),
    subscriptionCurrentPeriodEnd: v.optional(v.number()),
    subscriptionUpdatedAt: v.optional(v.number()),
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

  organizationInvitations: defineTable({
    organizationId: v.id("organizations"),
    email: v.string(),
    targetUserId: v.optional(v.id("users")),
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer"),
      v.literal("professional")
    ),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("revoked"), v.literal("expired")),
    invitedByUserId: v.id("users"),
    acceptedByUserId: v.optional(v.id("users")),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_organizationId_email", ["organizationId", "email"])
    .index("by_email_status", ["email", "status"]),

  subscriptionEvents: defineTable({
    providerEventId: v.string(),
    customerEmail: v.string(),
    tier: v.union(v.literal("inventor"), v.literal("pro"), v.literal("enterprise")),
    organizationPlanKey: v.optional(v.union(
      v.literal("inventor"),
      v.literal("pro"),
      v.literal("enterprise"),
      v.literal("studio_3"),
      v.literal("studio_6"),
      v.literal("studio_custom")
    )),
    status: v.union(
      v.literal("trialing"), v.literal("active"), v.literal("past_due"), v.literal("canceled"),
      v.literal("unpaid"), v.literal("incomplete"), v.literal("paused")
    ),
    subscriptionId: v.optional(v.string()),
    billingCustomerId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
    occurredAt: v.number(),
    appliedUserId: v.optional(v.id("users")),
    appliedOrganizationId: v.optional(v.id("organizations")),
    receivedAt: v.number(),
  })
    .index("by_providerEventId", ["providerEventId"])
    .index("by_customerEmail", ["customerEmail"])
    .index("by_appliedOrganizationId", ["appliedOrganizationId"]),

  privacyRequests: defineTable({
    userId: v.id("users"),
    requestType: v.union(v.literal("export"), v.literal("deletion")),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("rejected")),
    requestedAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolutionNotes: v.optional(v.string()),
  }).index("by_userId", ["userId"]).index("by_status", ["status"]),

  inventionAccessGrants: defineTable({
    inventionId: v.id("inventions"),
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    accessLevel: v.union(v.literal("read"), v.literal("edit"), v.literal("manage")),
    status: v.union(v.literal("active"), v.literal("revoked")),
    grantedByUserId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_inventionId", ["inventionId"])
    .index("by_userId", ["userId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_inventionId_userId", ["inventionId", "userId"]),

  organizationDailyUsage: defineTable({
    organizationId: v.id("organizations"),
    dateKey: v.string(),
    questionCount: v.number(),
    questionTokenUnits: v.number(),
    autonomousCostUnits: v.number(),
    reservedAutonomousCostUnits: v.optional(v.number()),
    migrationBaselineQuestionCount: v.optional(v.number()),
    migrationBaselineQuestionTokenUnits: v.optional(v.number()),
    migrationBaselineAutonomousCostUnits: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_organizationId_dateKey", ["organizationId", "dateKey"]),

  products: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    price: v.number(),
    categoryId: v.optional(v.id("categories")),
    imageUrl: v.optional(v.string()),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]).index("by_categoryId", ["categoryId"]),

  productFiles: defineTable({
    productId: v.id("products"),
    name: v.string(),
    storageId: v.id("_storage"),
    size: v.number(),
    mimeType: v.optional(v.string()),
    sortOrder: v.number(),
    createdAt: v.number(),
  }).index("by_productId", ["productId"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  faqEntries: defineTable({
    question: v.string(),
    answer: v.string(),
    sortOrder: v.number(),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  testimonials: defineTable({
    name: v.string(),
    role: v.optional(v.string()),
    quote: v.string(),
    avatarUrl: v.optional(v.string()),
    sortOrder: v.number(),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  purchases: defineTable({
    productId: v.id("products"),
    email: v.string(),
    amount: v.number(),
    currency: v.string(),
    paymentProvider: v.string(),
    paymentId: v.string(),
    fulfillmentStatus: v.union(v.literal("pending"), v.literal("fulfilled"), v.literal("refunded"), v.literal("failed")),
    downloadToken: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]).index("by_downloadToken", ["downloadToken"]),

  notifications: defineTable({
    userId: v.id("users"),
    inventionId: v.optional(v.id("inventions")),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  inventions: defineTable({
    userId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),
    title: v.string(),
    problemStatement: v.string(),
    targetAudience: v.string(),
    solutionDescription: v.string(),
    currentStageId: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("deleted")),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_organizationId", ["organizationId"])
    .index("by_organizationId_status", ["organizationId", "status"]),

  stageProgress: defineTable({
    inventionId: v.id("inventions"),
    stageId: v.number(),
    readinessScore: v.number(),
    completedFields: v.array(v.string()),
    completedAt: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_inventionId", ["inventionId"]).index("by_inventionId_stageId", ["inventionId", "stageId"]),

  conversations: defineTable({
    inventionId: v.id("inventions"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_inventionId", ["inventionId"]),

  conversationMessages: defineTable({
    inventionId: v.id("inventions"),
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_inventionId", ["inventionId"]).index("by_conversationId", ["conversationId"]),

  documents: defineTable({
    inventionId: v.id("inventions"),
    title: v.string(),
    kind: v.string(),
    content: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_inventionId", ["inventionId"]),

  validationResearch: defineTable({
    inventionId: v.id("inventions"),
    status: v.string(),
    sectionsJson: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_inventionId", ["inventionId"]),

  inventionRecords: defineTable({
    inventionId: v.id("inventions"),
    userId: v.id("users"),
    schemaVersion: v.number(),
    lifecycleStatus: v.string(),
    riskClass: v.string(),
    structuredBrief: v.optional(v.any()),
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
    requiresHumanApproval: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_inventionId", ["inventionId"]),

  approvalRequests: defineTable({
    inventionId: v.id("inventions"),
    workItemId: v.optional(v.id("atlasWorkItems")),
    approvalType: v.string(),
    title: v.string(),
    details: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("canceled")),
    requestedAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolvedByUserId: v.optional(v.id("users")),
  }).index("by_inventionId", ["inventionId"]),

  professionalReviews: defineTable({
    inventionId: v.id("inventions"),
    reviewType: v.string(),
    title: v.string(),
    status: v.union(v.literal("required"), v.literal("requested"), v.literal("approved"), v.literal("rejected"), v.literal("not_required")),
    assignedUserId: v.optional(v.id("users")),
    reviewerName: v.optional(v.string()),
    reviewerOrganization: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_inventionId", ["inventionId"]),

  deliverableDependencies: defineTable({
    inventionId: v.id("inventions"),
    deliverableId: v.id("atlasDeliverables"),
    dependencyType: v.string(),
    dependencyId: v.string(),
    createdAt: v.number(),
  }).index("by_inventionId", ["inventionId"]),

  atlasWorkItems: defineTable({
    inventionId: v.id("inventions"),
    kind: v.string(),
    title: v.string(),
    status: v.union(v.literal("queued"), v.literal("running"), v.literal("completed"), v.literal("failed"), v.literal("blocked"), v.literal("canceled")),
    priority: v.number(),
    inputSnapshot: v.optional(v.any()),
    outputSummary: v.optional(v.string()),
    attemptCount: v.number(),
    maxAttempts: v.optional(v.number()),
    estimatedCostUnits: v.optional(v.number()),
    actualCostUnits: v.optional(v.number()),
    reservedCostUnits: v.optional(v.number()),
    reservationDateKey: v.optional(v.string()),
    deliverableKind: v.optional(v.string()),
    dependsOnKinds: v.optional(v.array(v.string())),
    blockedReason: v.optional(v.string()),
    humanGateType: v.optional(v.string()),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_inventionId", ["inventionId"]),

  atlasDeliverables: defineTable({
    inventionId: v.id("inventions"),
    workItemId: v.optional(v.id("atlasWorkItems")),
    kind: v.string(),
    title: v.string(),
    summary: v.optional(v.string()),
    content: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    mimeType: v.optional(v.string()),
    version: v.number(),
    staleReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_inventionId", ["inventionId"]),

  atlasExecutionEvents: defineTable({
    inventionId: v.id("inventions"),
    eventType: v.string(),
    actorType: v.string(),
    summary: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_inventionId", ["inventionId"]),

  atlasDailyUsage: defineTable({
    userId: v.id("users"),
    dateKey: v.string(),
    questionCount: v.number(),
    questionTokenUnits: v.number(),
    autonomousCostUnits: v.number(),
    reservedAutonomousCostUnits: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]).index("by_userId_dateKey", ["userId", "dateKey"]),

  validationSections: defineTable({
    inventionId: v.id("inventions"),
    sectionId: v.string(),
    title: v.string(),
    content: v.string(),
    status: v.string(),
    generatedAt: v.number(),
    updatedAt: v.number(),
  }).index("by_inventionId", ["inventionId"]),
});