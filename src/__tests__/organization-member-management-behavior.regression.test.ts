import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthUserId: vi.fn(async () => "actor-user"),
}));

vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: mocks.getAuthUserId }));

import {
  removeMemberHandler,
  updateMemberRoleHandler,
} from "../../convex/organizations";

type Membership = {
  _id: string;
  organizationId: string;
  userId: string;
  role: "owner" | "admin" | "member" | "viewer" | "professional";
  status: "active" | "suspended" | "removed";
};

type AccessGrant = {
  _id: string;
  organizationId: string;
  userId: string;
};

function buildCtx(memberships: Membership[], accessGrants: AccessGrant[] = []) {
  const patches: Array<{ id: string; value: Record<string, unknown> }> = [];
  const deletes: string[] = [];
  const ctx = {
    db: {
      query: vi.fn((table: string) => {
        if (table !== "organizationMemberships" && table !== "inventionAccessGrants") {
          throw new Error(`Unexpected table ${table}`);
        }
        const rows = table === "organizationMemberships" ? memberships : accessGrants;
        return {
          withIndex: (_index: string, apply: (q: any) => unknown) => {
            const filters: Record<string, unknown> = {};
            const q: any = {
              eq(field: string, value: unknown) {
                filters[field] = value;
                return q;
              },
            };
            apply(q);
            const matches = rows.filter((row) =>
              Object.entries(filters).every(([field, value]) => (row as any)[field] === value)
            );
            return {
              first: vi.fn(async () => matches[0] ?? null),
              collect: vi.fn(async () => matches),
            };
          },
        };
      }),
      patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
        patches.push({ id: String(id), value });
      }),
      delete: vi.fn(async (id: string) => {
        deletes.push(String(id));
      }),
    },
  } as any;
  return { ctx, patches, deletes };
}

const orgId = "org-1" as any;

function actor(role: Membership["role"] = "admin"): Membership {
  return {
    _id: "membership-actor",
    organizationId: "org-1",
    userId: "actor-user",
    role,
    status: "active",
  };
}

function target(overrides: Partial<Membership> = {}): Membership {
  return {
    _id: "membership-target",
    organizationId: "org-1",
    userId: "target-user",
    role: "member",
    status: "active",
    ...overrides,
  };
}

describe("organization member management behavior", () => {
  beforeEach(() => {
    mocks.getAuthUserId.mockReset();
    mocks.getAuthUserId.mockResolvedValue("actor-user" as any);
  });

  it("rejects member-role changes from a non-manager before any write", async () => {
    const state = buildCtx([actor("viewer"), target()]);

    await expect(updateMemberRoleHandler(state.ctx, {
      organizationId: orgId,
      userId: "target-user" as any,
      role: "admin",
    })).rejects.toThrow(/Insufficient organization permissions/i);

    expect(state.patches).toEqual([]);
  });

  it("does not allow the owner role to be changed through member-role management", async () => {
    const state = buildCtx([actor("admin"), target({ role: "owner" })]);

    await expect(updateMemberRoleHandler(state.ctx, {
      organizationId: orgId,
      userId: "target-user" as any,
      role: "member",
    })).rejects.toThrow(/ownership cannot be changed/i);

    expect(state.patches).toEqual([]);
  });

  it("rejects an inactive target for role changes with zero writes", async () => {
    const state = buildCtx([actor("owner"), target({ status: "suspended" })]);

    await expect(updateMemberRoleHandler(state.ctx, {
      organizationId: orgId,
      userId: "target-user" as any,
      role: "viewer",
    })).rejects.toThrow(/Active organization member not found/i);

    expect(state.patches).toEqual([]);
  });

  it("changes an active non-owner role with exactly one membership patch", async () => {
    const state = buildCtx([actor("owner"), target()]);

    const result = await updateMemberRoleHandler(state.ctx, {
      organizationId: orgId,
      userId: "target-user" as any,
      role: "professional",
    });

    expect(result).toEqual({ membershipId: "membership-target" });
    expect(state.patches).toHaveLength(1);
    expect(state.patches[0].id).toBe("membership-target");
    expect(state.patches[0].value).toMatchObject({ role: "professional" });
  });

  it("does not remove an organization owner and performs zero writes", async () => {
    const state = buildCtx([actor("admin"), target({ role: "owner" })], [
      { _id: "grant-1", organizationId: "org-1", userId: "target-user" },
    ]);

    await expect(removeMemberHandler(state.ctx, {
      organizationId: orgId,
      userId: "target-user" as any,
    })).rejects.toThrow(/Transfer organization ownership before removing the owner/i);

    expect(state.patches).toEqual([]);
    expect(state.deletes).toEqual([]);
  });

  it("does not let a manager remove their own membership through the member-removal path", async () => {
    const state = buildCtx([actor("admin")], [
      { _id: "grant-self", organizationId: "org-1", userId: "actor-user" },
    ]);

    await expect(removeMemberHandler(state.ctx, {
      organizationId: orgId,
      userId: "actor-user" as any,
    })).rejects.toThrow(/leave-organization flow/i);

    expect(state.patches).toEqual([]);
    expect(state.deletes).toEqual([]);
  });

  it("treats an already inactive target as a no-op with zero writes", async () => {
    const state = buildCtx([actor("owner"), target({ status: "removed" })], [
      { _id: "grant-old", organizationId: "org-1", userId: "target-user" },
    ]);

    const result = await removeMemberHandler(state.ctx, {
      organizationId: orgId,
      userId: "target-user" as any,
    });

    expect(result).toEqual({ removed: false });
    expect(state.patches).toEqual([]);
    expect(state.deletes).toEqual([]);
  });

  it("removes an active non-owner with exactly one membership patch when there are no grants", async () => {
    const state = buildCtx([actor("admin"), target()]);

    const result = await removeMemberHandler(state.ctx, {
      organizationId: orgId,
      userId: "target-user" as any,
    });

    expect(result).toEqual({ removed: true });
    expect(state.deletes).toEqual([]);
    expect(state.patches).toHaveLength(1);
    expect(state.patches[0].id).toBe("membership-target");
    expect(state.patches[0].value).toMatchObject({ status: "removed" });
  });

  it("deletes only the departing member's grants from the same organization before removal completes", async () => {
    const state = buildCtx([actor("owner"), target()], [
      { _id: "grant-1", organizationId: "org-1", userId: "target-user" },
      { _id: "grant-2", organizationId: "org-1", userId: "target-user" },
      { _id: "grant-other-org", organizationId: "org-2", userId: "target-user" },
      { _id: "grant-other-user", organizationId: "org-1", userId: "someone-else" },
    ]);

    const result = await removeMemberHandler(state.ctx, {
      organizationId: orgId,
      userId: "target-user" as any,
    });

    expect(result).toEqual({ removed: true });
    expect(state.deletes).toEqual(["grant-1", "grant-2"]);
    expect(state.patches).toHaveLength(1);
    expect(state.patches[0].id).toBe("membership-target");
    expect(state.patches[0].value).toMatchObject({ status: "removed" });
  });
});
