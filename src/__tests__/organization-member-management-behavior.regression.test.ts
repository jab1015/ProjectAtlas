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

function buildCtx(memberships: Membership[]) {
  const patches: Array<{ id: string; value: Record<string, unknown> }> = [];
  const ctx = {
    db: {
      query: vi.fn((table: string) => {
        if (table !== "organizationMemberships") throw new Error(`Unexpected table ${table}`);
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
            const matches = memberships.filter((row) =>
              Object.entries(filters).every(([field, value]) => (row as any)[field] === value)
            );
            return {
              first: vi.fn(async () => matches[0] ?? null),
            };
          },
        };
      }),
      patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
        patches.push({ id: String(id), value });
      }),
    },
  } as any;
  return { ctx, patches };
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
    const state = buildCtx([actor("admin"), target({ role: "owner" })]);

    await expect(removeMemberHandler(state.ctx, {
      organizationId: orgId,
      userId: "target-user" as any,
    })).rejects.toThrow(/Transfer organization ownership before removing the owner/i);

    expect(state.patches).toEqual([]);
  });

  it("does not let a manager remove their own membership through the member-removal path", async () => {
    const state = buildCtx([actor("admin")]);

    await expect(removeMemberHandler(state.ctx, {
      organizationId: orgId,
      userId: "actor-user" as any,
    })).rejects.toThrow(/leave-organization flow/i);

    expect(state.patches).toEqual([]);
  });

  it("treats an already inactive target as a no-op with zero writes", async () => {
    const state = buildCtx([actor("owner"), target({ status: "removed" })]);

    const result = await removeMemberHandler(state.ctx, {
      organizationId: orgId,
      userId: "target-user" as any,
    });

    expect(result).toEqual({ removed: false });
    expect(state.patches).toEqual([]);
  });

  it("removes an active non-owner with exactly one membership patch", async () => {
    const state = buildCtx([actor("admin"), target()]);

    const result = await removeMemberHandler(state.ctx, {
      organizationId: orgId,
      userId: "target-user" as any,
    });

    expect(result).toEqual({ removed: true });
    expect(state.patches).toHaveLength(1);
    expect(state.patches[0].id).toBe("membership-target");
    expect(state.patches[0].value).toMatchObject({ status: "removed" });
  });
});
