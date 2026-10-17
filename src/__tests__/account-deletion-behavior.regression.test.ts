import { describe, expect, it, vi } from "vitest";
import { deleteAccountData } from "../../convex/accountDeletion";

type Row = Record<string, any> & { _id: string };

function buildGuardState(input: { user: Row; memberships?: Row[]; organizations?: Row[] }) {
  const rows = new Map<string, Row>();
  rows.set(input.user._id, input.user);
  for (const organization of input.organizations ?? []) rows.set(organization._id, organization);

  const deletes: string[] = [];
  const patches: Array<{ id: string; value: Record<string, unknown> }> = [];
  const storageDeletes: string[] = [];

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
          return {
            collect: vi.fn(async () => {
              const candidates = table === "organizationMemberships" ? (input.memberships ?? []) : [];
              return candidates.filter((row) =>
                Object.entries(filters).every(([field, value]) => row[field] === value)
              );
            }),
          };
        },
        collect: vi.fn(async () => []),
      })),
      delete: vi.fn(async (id: string) => {
        deletes.push(String(id));
      }),
      patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
        patches.push({ id: String(id), value });
      }),
    },
    storage: {
      delete: vi.fn(async (id: string) => {
        storageDeletes.push(String(id));
      }),
    },
  } as any;

  return { ctx, deletes, patches, storageDeletes };
}

describe("account deletion destructive guards", () => {
  it("rejects administrator deletion before any query or destructive side effect", async () => {
    const state = buildGuardState({
      user: { _id: "user-admin", role: "admin", email: "admin@example.test" },
    });

    await expect(deleteAccountData(state.ctx, "user-admin" as any)).rejects.toThrow(
      /Administrator accounts cannot be deleted through the privacy queue/i,
    );

    expect(state.ctx.db.query).not.toHaveBeenCalled();
    expect(state.deletes).toEqual([]);
    expect(state.patches).toEqual([]);
    expect(state.storageDeletes).toEqual([]);
  });

  it("blocks a suspended company owner until ownership is resolved and performs zero destructive writes", async () => {
    const state = buildGuardState({
      user: { _id: "user-owner", role: "user", email: "owner@example.test" },
      memberships: [
        {
          _id: "membership-1",
          userId: "user-owner",
          organizationId: "org-company",
          role: "owner",
          status: "suspended",
        },
      ],
      organizations: [
        {
          _id: "org-company",
          kind: "company",
          status: "active",
        },
      ],
    });

    await expect(deleteAccountData(state.ctx, "user-owner" as any)).rejects.toThrow(
      /Transfer or close company\/studio ownership before deleting this account/i,
    );

    expect(state.deletes).toEqual([]);
    expect(state.patches).toEqual([]);
    expect(state.storageDeletes).toEqual([]);
  });

  it("blocks a suspended studio owner with the same fail-closed zero-write behavior", async () => {
    const state = buildGuardState({
      user: { _id: "user-owner", role: "user", email: "owner@example.test" },
      memberships: [
        {
          _id: "membership-1",
          userId: "user-owner",
          organizationId: "org-studio",
          role: "owner",
          status: "suspended",
        },
      ],
      organizations: [
        {
          _id: "org-studio",
          kind: "studio",
          status: "active",
        },
      ],
    });

    await expect(deleteAccountData(state.ctx, "user-owner" as any)).rejects.toThrow(
      /Transfer or close company\/studio ownership before deleting this account/i,
    );

    expect(state.deletes).toEqual([]);
    expect(state.patches).toEqual([]);
    expect(state.storageDeletes).toEqual([]);
  });
});
