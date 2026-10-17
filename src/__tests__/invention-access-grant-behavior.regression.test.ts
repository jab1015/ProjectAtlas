import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthUserId: vi.fn(async () => "actor-user"),
}));

vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: mocks.getAuthUserId }));

import { grantInventionAccessHandler } from "../../convex/organizations";

type Row = Record<string, any> & { _id: string };

function buildCtx(input: {
  invention: Row;
  memberships?: Row[];
  grants?: Row[];
}) {
  const rows = new Map<string, Row>([[input.invention._id, input.invention]]);
  const patches: Array<{ id: string; value: Record<string, unknown> }> = [];
  const inserts: Array<{ table: string; value: Record<string, unknown> }> = [];

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
            ? (input.memberships ?? [])
            : table === "inventionAccessGrants"
              ? (input.grants ?? [])
              : [];
          const matches = source.filter((row) =>
            Object.entries(filters).every(([field, value]) => row[field] === value)
          );
          return {
            first: vi.fn(async () => matches[0] ?? null),
          };
        },
      })),
      patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
        patches.push({ id: String(id), value });
      }),
      insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
        inserts.push({ table, value });
        return "grant-new";
      }),
    },
  } as any;

  return { ctx, patches, inserts };
}

function invention(overrides: Record<string, unknown> = {}): Row {
  return {
    _id: "inv-1",
    userId: "owner-user",
    organizationId: "org-1",
    ...overrides,
  };
}

function membership(userId: string, role: string, status = "active", organizationId = "org-1"): Row {
  return {
    _id: `membership-${userId}-${organizationId}`,
    organizationId,
    userId,
    role,
    status,
  };
}

describe("invention access grant behavior", () => {
  beforeEach(() => {
    mocks.getAuthUserId.mockReset();
    mocks.getAuthUserId.mockResolvedValue("actor-user" as any);
  });

  it("rejects a non-manager before any grant write", async () => {
    const state = buildCtx({
      invention: invention(),
      memberships: [
        membership("actor-user", "viewer"),
        membership("target-user", "member"),
      ],
    });

    await expect(grantInventionAccessHandler(state.ctx, {
      inventionId: "inv-1" as any,
      userId: "target-user" as any,
      access: "edit",
    })).rejects.toThrow(/Invention management access required/i);

    expect(state.patches).toEqual([]);
    expect(state.inserts).toEqual([]);
  });

  it("rejects a target whose organization membership is suspended with zero grant writes", async () => {
    const state = buildCtx({
      invention: invention(),
      memberships: [
        membership("actor-user", "owner"),
        membership("target-user", "member", "suspended"),
      ],
    });

    await expect(grantInventionAccessHandler(state.ctx, {
      inventionId: "inv-1" as any,
      userId: "target-user" as any,
      access: "view",
    })).rejects.toThrow(/Target user must be an active organization member/i);

    expect(state.patches).toEqual([]);
    expect(state.inserts).toEqual([]);
  });

  it("rejects a user who is active only in a different organization", async () => {
    const state = buildCtx({
      invention: invention(),
      memberships: [
        membership("actor-user", "owner"),
        membership("target-user", "member", "active", "org-2"),
      ],
    });

    await expect(grantInventionAccessHandler(state.ctx, {
      inventionId: "inv-1" as any,
      userId: "target-user" as any,
      access: "review",
    })).rejects.toThrow(/Target user must be an active organization member/i);

    expect(state.patches).toEqual([]);
    expect(state.inserts).toEqual([]);
  });

  it("requires legacy inventions to migrate before explicit organization sharing", async () => {
    const state = buildCtx({
      invention: invention({ organizationId: undefined, userId: "actor-user" }),
    });

    await expect(grantInventionAccessHandler(state.ctx, {
      inventionId: "inv-1" as any,
      userId: "target-user" as any,
      access: "view",
    })).rejects.toThrow(/Migrate invention to an organization first/i);

    expect(state.patches).toEqual([]);
    expect(state.inserts).toEqual([]);
  });

  it("updates an existing grant with the requested access and current granting manager", async () => {
    const state = buildCtx({
      invention: invention(),
      memberships: [
        membership("actor-user", "owner"),
        membership("target-user", "member"),
      ],
      grants: [
        {
          _id: "grant-existing",
          inventionId: "inv-1",
          userId: "target-user",
          organizationId: "org-1",
          access: "view",
        },
      ],
    });

    const result = await grantInventionAccessHandler(state.ctx, {
      inventionId: "inv-1" as any,
      userId: "target-user" as any,
      access: "edit",
    });

    expect(result).toBe("grant-existing");
    expect(state.inserts).toEqual([]);
    expect(state.patches).toHaveLength(1);
    expect(state.patches[0]).toMatchObject({
      id: "grant-existing",
      value: { access: "edit", grantedByUserId: "actor-user" },
    });
  });

  it("creates a new grant bound to the same organization and records the granting manager", async () => {
    const state = buildCtx({
      invention: invention(),
      memberships: [
        membership("actor-user", "owner"),
        membership("target-user", "professional"),
      ],
    });

    const result = await grantInventionAccessHandler(state.ctx, {
      inventionId: "inv-1" as any,
      userId: "target-user" as any,
      access: "review",
    });

    expect(result).toBe("grant-new");
    expect(state.patches).toEqual([]);
    expect(state.inserts).toHaveLength(1);
    expect(state.inserts[0]).toMatchObject({
      table: "inventionAccessGrants",
      value: {
        inventionId: "inv-1",
        organizationId: "org-1",
        userId: "target-user",
        access: "review",
        grantedByUserId: "actor-user",
      },
    });
  });
});
