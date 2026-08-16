import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export type AccountDeletionSummary = {
  inventionsDeleted: number;
  generatedFilesDeleted: number;
  uploadedFilesDeleted: number;
  usageRowsDeleted: number;
  notificationsDeleted: number;
  purchasesAnonymized: number;
  subscriptionEventsAnonymized: number;
  authSessionsDeleted: number;
  authAccountsDeleted: number;
};

async function deleteInventionData(
  ctx: MutationCtx,
  inventionId: Id<"inventions">,
): Promise<{ generatedFilesDeleted: number; uploadedFilesDeleted: number }> {
  let generatedFilesDeleted = 0;
  let uploadedFilesDeleted = 0;

  const deliverables = await ctx.db
    .query("atlasDeliverables")
    .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
    .collect();
  for (const row of deliverables) {
    if (row.storageId) {
      await ctx.storage.delete(row.storageId);
      generatedFilesDeleted += 1;
    }
  }

  const documents = await ctx.db
    .query("documents")
    .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
    .collect();
  for (const row of documents) {
    if (row.storageId) {
      await ctx.storage.delete(row.storageId as Id<"_storage">);
      uploadedFilesDeleted += 1;
    }
  }

  const evidenceSources = await ctx.db
    .query("evidenceSources")
    .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
    .collect();
  for (const source of evidenceSources) {
    const storageId = source.metadata?.storageId as Id<"_storage"> | undefined;
    if (storageId) {
      await ctx.storage.delete(storageId);
      uploadedFilesDeleted += 1;
    }
  }

  const groups = await Promise.all([
    ctx.db.query("deliverableDependencies").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ctx.db.query("atlasExecutionEvents").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ctx.db.query("professionalReviews").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    Promise.resolve(deliverables),
    ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ctx.db.query("approvalRequests").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ctx.db.query("inventionDecisions").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ctx.db.query("inventionAssumptions").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    Promise.resolve(evidenceSources),
    ctx.db.query("inventionRecords").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ctx.db.query("stageProgress").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ctx.db.query("conversationMessages").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ctx.db.query("conversations").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    Promise.resolve(documents),
    ctx.db.query("validationResearch").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ctx.db.query("inventionAccessGrants").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
  ]);

  for (const rows of groups) {
    for (const row of rows) await ctx.db.delete(row._id);
  }

  await ctx.db.delete(inventionId);
  return { generatedFilesDeleted, uploadedFilesDeleted };
}

export async function deleteAccountData(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<AccountDeletionSummary> {
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("Account already deleted or user record missing");
  if (user.role === "admin") throw new Error("Administrator accounts cannot be deleted through the privacy queue");

  const memberships = await ctx.db
    .query("organizationMemberships")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  const personalOrganizationIds: Id<"organizations">[] = [];
  for (const membership of memberships) {
    if (membership.status !== "active") continue;
    const organization = await ctx.db.get(membership.organizationId);
    if (!organization || organization.status === "closed") continue;
    if (membership.role === "owner" && organization.kind !== "personal") {
      throw new Error("Transfer or close company/studio ownership before deleting this account");
    }
    if (membership.role === "owner" && organization.kind === "personal") {
      personalOrganizationIds.push(organization._id);
    }
  }

  const legacyInventions = (await ctx.db
    .query("inventions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect())
    .filter((invention) => !invention.organizationId);

  const deletableById = new Map<string, (typeof legacyInventions)[number]>();
  for (const invention of legacyInventions) deletableById.set(String(invention._id), invention);
  for (const organizationId of personalOrganizationIds) {
    const inventions = await ctx.db
      .query("inventions")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
      .collect();
    for (const invention of inventions) deletableById.set(String(invention._id), invention);
  }
  const inventions = [...deletableById.values()];

  let generatedFilesDeleted = 0;
  let uploadedFilesDeleted = 0;
  for (const invention of inventions) {
    const result = await deleteInventionData(ctx, invention._id);
    generatedFilesDeleted += result.generatedFilesDeleted;
    uploadedFilesDeleted += result.uploadedFilesDeleted;
  }

  // A departing member loses their grants/memberships but cannot delete company
  // or studio inventions merely because they originally created the record.
  const accessGrants = await ctx.db
    .query("inventionAccessGrants")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const grant of accessGrants) await ctx.db.delete(grant._id);
  for (const membership of memberships) await ctx.db.delete(membership._id);

  for (const organizationId of personalOrganizationIds) {
    const remainingMemberships = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
      .collect();
    for (const membership of remainingMemberships) await ctx.db.delete(membership._id);
    const organization = await ctx.db.get(organizationId);
    if (organization) await ctx.db.delete(organizationId);
  }

  const notifications = await ctx.db
    .query("notifications")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const row of notifications) await ctx.db.delete(row._id);

  const usage = await ctx.db
    .query("atlasDailyUsage")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const row of usage) await ctx.db.delete(row._id);

  const purchases = await ctx.db
    .query("purchases")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const row of purchases) {
    await ctx.db.patch(row._id, {
      userId: undefined,
      customerEmail: `deleted-${row._id}@invalid.local`,
      customerName: undefined,
    });
  }

  const subscriptionEvents = user.email
    ? await ctx.db
        .query("subscriptionEvents")
        .withIndex("by_customerEmail", (q) => q.eq("customerEmail", user.email!))
        .collect()
    : [];
  for (const row of subscriptionEvents) {
    await ctx.db.patch(row._id, {
      customerEmail: `deleted-${row._id}@invalid.local`,
      appliedUserId: undefined,
      subscriptionId: undefined,
      billingCustomerId: undefined,
    });
  }

  const sessions = await ctx.db
    .query("authSessions")
    .withIndex("userId", (q) => q.eq("userId", userId))
    .collect();
  for (const session of sessions) {
    const refreshTokens = await ctx.db
      .query("authRefreshTokens")
      .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
      .collect();
    for (const token of refreshTokens) await ctx.db.delete(token._id);

    const verifiers = await ctx.db.query("authVerifiers").collect();
    for (const verifier of verifiers) {
      if (verifier.sessionId === session._id) await ctx.db.delete(verifier._id);
    }
    await ctx.db.delete(session._id);
  }

  const accounts = await ctx.db
    .query("authAccounts")
    .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
    .collect();
  for (const account of accounts) {
    const codes = await ctx.db
      .query("authVerificationCodes")
      .withIndex("accountId", (q) => q.eq("accountId", account._id))
      .collect();
    for (const code of codes) await ctx.db.delete(code._id);
    await ctx.db.delete(account._id);
  }

  if (user.email) {
    const rateLimits = await ctx.db
      .query("authRateLimits")
      .withIndex("identifier", (q) => q.eq("identifier", user.email!))
      .collect();
    for (const row of rateLimits) await ctx.db.delete(row._id);
  }

  await ctx.db.delete(userId);

  return {
    inventionsDeleted: inventions.length,
    generatedFilesDeleted,
    uploadedFilesDeleted,
    usageRowsDeleted: usage.length,
    notificationsDeleted: notifications.length,
    purchasesAnonymized: purchases.length,
    subscriptionEventsAnonymized: subscriptionEvents.length,
    authSessionsDeleted: sessions.length,
    authAccountsDeleted: accounts.length,
  };
}
