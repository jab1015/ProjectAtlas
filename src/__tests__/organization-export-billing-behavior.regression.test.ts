import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../convex/organizations", () => ({
  requireOrganizationRole: vi.fn(),
}));

import { requireOrganizationRole } from "../../convex/organizations";
import { getOrganizationStructuredExportHandler } from "../../convex/organizationExport";

const mockedRequireOrganizationRole = vi.mocked(requireOrganizationRole);

function buildState() {
  const queriedTables: string[] = [];
  const organization = {
    _id: "org-company",
    name: "Example Company",
    kind: "company",
    planKey: "pro",
    status: "active",
    subscriptionStatus: "active",
    createdAt: 1,
    updatedAt: 2,
  };
  const subscriptionEvent = {
    _id: "subscription-event-1",
    appliedOrganizationId: "org-company",
    customerEmail: "billing@example.test",
  };

  const ctx = {
    db: {
      get: vi.fn(async (id: string) => (String(id) === "org-company" ? organization : null)),
      query: vi.fn((table: string) => {
        queriedTables.push(table);
        const q: any = {
          withIndex: (_index: string, apply: (builder: any) => unknown) => {
            const builder: any = {
              eq() {
                return builder;
              },
            };
            apply(builder);
            return q;
          },
          collect: vi.fn(async () => []),
          take: vi.fn(async () => (table === "subscriptionEvents" ? [subscriptionEvent] : [])),
        };
        return q;
      }),
    },
  } as any;

  return { ctx, queriedTables, subscriptionEvent };
}

describe("organization export billing-attribution behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("excludes raw subscription events for an organization admin and never queries them", async () => {
    mockedRequireOrganizationRole.mockResolvedValue({
      userId: "user-admin" as any,
      membership: { _id: "membership-admin", role: "admin", status: "active" } as any,
    });
    const state = buildState();

    const result = await getOrganizationStructuredExportHandler(state.ctx, {
      organizationId: "org-company" as any,
    });

    expect(result.billingAttributionIncluded).toBe(false);
    expect(result.subscriptionEvents).toEqual([]);
    expect(result.scope).toMatch(/billing-attribution data is excluded/i);
    expect(state.queriedTables).not.toContain("subscriptionEvents");
  });

  it("includes organization-bound subscription events for the owner billing authority", async () => {
    mockedRequireOrganizationRole.mockResolvedValue({
      userId: "user-owner" as any,
      membership: { _id: "membership-owner", role: "owner", status: "active" } as any,
    });
    const state = buildState();

    const result = await getOrganizationStructuredExportHandler(state.ctx, {
      organizationId: "org-company" as any,
    });

    expect(result.billingAttributionIncluded).toBe(true);
    expect(result.subscriptionEvents).toEqual([state.subscriptionEvent]);
    expect(state.queriedTables).toContain("subscriptionEvents");
  });
});
