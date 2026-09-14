from pathlib import Path

path = Path('convex/organizationExport.ts')
text = path.read_text(encoding='utf-8')
text = text.replace('import { requireOrganizationRole } from "./organizations";\n', 'import { requireOrganizationRole } from "./organizations";\nimport { canManageBilling } from "./organizationPolicyLogic";\n', 1)
text = text.replace('''    await requireOrganizationRole(ctx, args.organizationId, ["owner", "admin"]);\n    const organization = await ctx.db.get(args.organizationId);''', '''    const { membership } = await requireOrganizationRole(ctx, args.organizationId, ["owner", "admin"]);\n    const includeBillingAttribution = canManageBilling(membership.role);\n    const organization = await ctx.db.get(args.organizationId);''', 1)
text = text.replace('''      ctx.db.query("subscriptionEvents").withIndex("by_appliedOrganizationId", (q) => q.eq("appliedOrganizationId", args.organizationId)).take(ROW_LIMIT + 1),''', '''      includeBillingAttribution\n        ? ctx.db.query("subscriptionEvents").withIndex("by_appliedOrganizationId", (q) => q.eq("appliedOrganizationId", args.organizationId)).take(ROW_LIMIT + 1)\n        : Promise.resolve([]),''', 1)
text = text.replace('''      scope: "Organization-owned InventSmith structured project, membership invitation, and billing-attribution data. Binary bytes and authentication secrets are not embedded.",''', '''      scope: includeBillingAttribution\n        ? "Organization-owned InventSmith structured project, membership invitation, and owner-authorized billing-attribution data. Binary bytes and authentication secrets are not embedded."\n        : "Organization-owned InventSmith structured project and membership invitation data. Raw billing-attribution data is excluded because organization billing authority is owner-only. Binary bytes and authentication secrets are not embedded.",\n      billingAttributionIncluded: includeBillingAttribution,''', 1)
path.write_text(text, encoding='utf-8')

# Align export security regressions with the owner-only billing boundary.
test = Path('src/__tests__/organization-privacy-export.regression.test.ts')
t = test.read_text(encoding='utf-8')
t = t.replace('''    expect(organizationExport).toContain('query("subscriptionEvents")');\n    expect(organizationExport).toContain('withIndex("by_appliedOrganizationId"');\n    expect(organizationExport).toContain("subscriptionEvents: bounded(subscriptionEvents");\n    expect(organizationExport).toContain("subscriptionUpdatedAt: organization.subscriptionUpdatedAt");''', '''    expect(organizationExport).toContain("canManageBilling");\n    expect(organizationExport).toContain("includeBillingAttribution");\n    expect(organizationExport).toContain('query("subscriptionEvents")');\n    expect(organizationExport).toContain('withIndex("by_appliedOrganizationId"');\n    expect(organizationExport).toContain(': Promise.resolve([])');\n    expect(organizationExport).toContain("billingAttributionIncluded: includeBillingAttribution");\n    expect(organizationExport).toContain("subscriptionEvents: bounded(subscriptionEvents");\n    expect(organizationExport).toContain("organization billing authority is owner-only");\n    expect(organizationExport).toContain("subscriptionUpdatedAt: organization.subscriptionUpdatedAt");''', 1)
test.write_text(t, encoding='utf-8')

# Lock the policy/export relationship in backend authorization coverage too.
test = Path('src/__tests__/backend-authorization.regression.test.ts')
t = test.read_text(encoding='utf-8')
needle = '''  it("binds file access to a fulfilled purchase token and product", () => {'''
insert = '''  it("keeps raw organization billing attribution owner-only even though admins may export project data", () => {\n    const exportSource = source("organizationExport.ts");\n    const block = exportedFunctionBlock(exportSource, "getOrganizationStructuredExport");\n    expect(block).toContain('requireOrganizationRole(ctx, args.organizationId, ["owner", "admin"])');\n    expect(block).toContain("canManageBilling(membership.role)");\n    expect(block).toContain("includeBillingAttribution");\n    expect(block).toContain(': Promise.resolve([])');\n  });\n\n'''
if insert not in t:
    if needle not in t:
        raise SystemExit('backend auth insertion anchor missing')
    t = t.replace(needle, insert + needle, 1)
test.write_text(t, encoding='utf-8')

print('Applied owner-only billing attribution export boundary')
