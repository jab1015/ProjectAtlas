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
    // Atlas MVP fields
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    subscriptionTier: v.optional(
      v.union(
        v.literal("free"),
        v.literal("inventor"),
        v.literal("pro"),
        v.literal("enterprise")
      )
    ),
    // Extension point: Inventor Twin
    inventorTwin: v.optional(v.null()),
  })
    .index("email", ["email"])
    .index("by_role", ["role"]),

  // ── Atlas: Inventions ────────────────────────────────────────────────────────
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
    // Extension point: Team workspaces
    organizationId: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"]),

  // ── Atlas: Stage Progress ────────────────────────────────────────────────────
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

  // ── Extension point: Document upload / file storage ────────────────────────
  documents: defineTable({
    inventionId: v.id("inventions"),
    userId: v.id("users"),
    fileName: v.string(),
    storageId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_inventionId", ["inventionId"]),

  // ── Atlas: Validation Research ──────────────────────────────────────────────
  // Stores Atlas-generated validation research results for each invention.
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
