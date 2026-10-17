import { describe, expect, it, vi } from "vitest";
import {
  filterPersonalSubscriptionEvents,
  personalExportScope,
} from "../../convex/privacyExport";

type Row = Record<string, any> & { _id: string };

function buildScopeCtx(input: {
  user: Row;
  memberships: Row[];
  organizations: Row[];
  inventions: Row[];
}) {
  const rows = new Map<string, Row>();
  rows.set(input.user._id, input.user);
  for (const organization of input.organizations) rows.set(organization._id, organization);

  const ctx = {
    db: {
      get: vi.fn(async (id: string) => rows.get(String(id)) ?? null),
      query: vi.fn((table: string) => ({
        withIndex: (_index: string, apply: (q: any) => unknown) => {
          const filters: Record<string, unknown> = {};
          const q: any = {
            eq(field: string, value: unknown) {
              filters[field] = value;
              return q;
            },
          };
          apply(q);
          const source = table === "organizationMemberships"
            ? input.memberships
            : table === "inventions"
              ? input.inventions
              : [];
          return {
            collect: vi.fn(async () => source.filter((row) =>
              Object.entries(filters).every(([field, value]) => row[field] === value)
            )),
          };
        },
      })),
    },
  } as any;

  return ctx;
}

describe("personal privacy export behavior", () => {
  it("includes only legacy and owner-personal inventions while excluding company/studio inventions created by the user", async () => {
    const ctx = buildScopeCtx({
      user: { _id: "user-1", email: "person@example.test" },
      memberships: [
        { _id: "m-personal", userId: "user-1", organizationId: "org-personal", role: "owner", status: "active" },
        { _id: "m-company", userId: "user-1", organizationId: "org-company", role: "owner", status: "active" },
        { _id: "m-studio", userId: "user-1", organizationId: "org-studio", role: "admin", status: "active" },
      ],
      organizations: [
        { _id: "org-personal", name: "My InventSmith", kind: "personal" },
        { _id: "org-company", name: "Company", kind: "company" },
        { _id: "org-studio", name: "Studio", kind: "studio" },
      ],
      inventions: [
        { _id: "inv-legacy", userId: "user-1", title: "Legacy" },
        { _id: "inv-personal", userId: "user-1", organizationId: "org-personal", title: "Personal" },
        { _id: "inv-company", userId: "user-1", organizationId: "org-company", title: "Company" },
        { _id: "inv-studio", userId: "user-1", organizationId: "org-studio", title: "Studio" },
      ],
    });

    const result = await personalExportScope(ctx, "user-1" as any);

    expect(result.inventions.map((row: Row) => row._id)).toEqual(["inv-legacy", "inv-personal"]);
    expect(result.personalOrganizationIdValues.map(String)).toEqual(["org-personal"]);
    expect(result.organizationAffiliations.map((row: any) => row.organizationId)).toEqual([
      "org-personal",
      "org-company",
      "org-studio",
    ]);
  });

  it("does not treat a non-owner personal-organization membership as personal export ownership", async () => {
    const ctx = buildScopeCtx({
      user: { _id: "user-1", email: "person@example.test" },
      memberships: [
        { _id: "m-personal", userId: "user-1", organizationId: "org-personal", role: "member", status: "active" },
      ],
      organizations: [
        { _id: "org-personal", name: "Someone Else Personal", kind: "personal" },
      ],
      inventions: [
        { _id: "inv-personal", userId: "user-1", organizationId: "org-personal", title: "Not personally owned" },
      ],
    });

    const result = await personalExportScope(ctx, "user-1" as any);

    expect(result.inventions).toEqual([]);
    expect(result.personalOrganizationIdValues).toEqual([]);
    expect(result.organizationAffiliations).toHaveLength(1);
  });

  it("omits removed organization memberships from affiliations and personal ownership scope", async () => {
    const ctx = buildScopeCtx({
      user: { _id: "user-1", email: "person@example.test" },
      memberships: [
        { _id: "m-removed", userId: "user-1", organizationId: "org-personal", role: "owner", status: "removed" },
      ],
      organizations: [
        { _id: "org-personal", name: "Old Personal", kind: "personal" },
      ],
      inventions: [
        { _id: "inv-personal", userId: "user-1", organizationId: "org-personal", title: "Old invention" },
      ],
    });

    const result = await personalExportScope(ctx, "user-1" as any);

    expect(result.inventions).toEqual([]);
    expect(result.personalOrganizationIdValues).toEqual([]);
    expect(result.organizationAffiliations).toEqual([]);
    expect(ctx.db.get).toHaveBeenCalledTimes(1);
  });

  it("fails closed when the target user profile is missing before organization or invention queries", async () => {
    const ctx = buildScopeCtx({
      user: { _id: "different-user" },
      memberships: [],
      organizations: [],
      inventions: [],
    });

    await expect(personalExportScope(ctx, "user-1" as any)).rejects.toThrow(/User profile not found/i);
    expect(ctx.db.query).not.toHaveBeenCalled();
  });

  it("keeps subscription events bound only to the user or an owned personal organization", () => {
    const events = [
      { _id: "user-only", appliedUserId: "user-1" },
      { _id: "personal-user", appliedUserId: "user-1", appliedOrganizationId: "org-personal" },
      { _id: "personal-org-only", appliedOrganizationId: "org-personal" },
      { _id: "company-user", appliedUserId: "user-1", appliedOrganizationId: "org-company" },
      { _id: "other-user", appliedUserId: "user-2" },
      { _id: "unbound" },
    ];

    const result = filterPersonalSubscriptionEvents(
      events as any,
      "user-1" as any,
      ["org-personal" as any],
    );

    expect(result.map((event: any) => event._id)).toEqual([
      "user-only",
      "personal-user",
      "personal-org-only",
    ]);
  });

  it("does not let a matching user binding override a non-personal organization binding", () => {
    const result = filterPersonalSubscriptionEvents(
      [{ _id: "company", appliedUserId: "user-1", appliedOrganizationId: "org-company" }] as any,
      "user-1" as any,
      ["org-personal" as any],
    );

    expect(result).toEqual([]);
  });
});
