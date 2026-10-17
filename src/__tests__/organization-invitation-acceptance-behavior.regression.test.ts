import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthUserId: vi.fn(async () => "user-target"),
}));

vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: mocks.getAuthUserId }));

import { acceptInvitationHandler } from "../../convex/organizationInvitations";

type Row = Record<string, any> & { _id: string };

function buildCtx(input: {
  user?: Row;
  extraUsers?: Row[];
  invitation: Row;
  organization?: Row;
  memberships?: Row[];
  invitations?: Row[];
}) {
  const rows = new Map<string, Row>();
  if (input.user) rows.set(input.user._id, input.user);
  for (const user of input.extraUsers ?? []) rows.set(user._id, user);
  rows.set(input.invitation._id, input.invitation);
  if (input.organization) rows.set(input.organization._id, input.organization);

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
          let source: Row[] = [];
          if (table === "users") source = [input.user, ...(input.extraUsers ?? [])].filter(Boolean) as Row[];
          if (table === "organizationMemberships") source = input.memberships ?? [];
          if (table === "organizationInvitations") source = input.invitations ?? [input.invitation];
          const matches = source.filter((row) =>
            Object.entries(filters).every(([field, value]) => row[field] === value)
          );
          return {
            collect: vi.fn(async () => matches),
          };
        },
      })),
      patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
        patches.push({ id: String(id), value });
      }),
      insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
        inserts.push({ table, value });
        return "membership-new";
      }),
    },
  } as any;

  return { ctx, patches, inserts };
}

const future = Date.now() + 60_000;

function invitation(overrides: Record<string, unknown> = {}): Row {
  return {
    _id: "invite-1",
    organizationId: "org-1",
    email: "target@example.test",
    role: "member",
    status: "pending",
    acceptedByUserId: "user-target",
    expiresAt: future,
    ...overrides,
  };
}

function user(overrides: Record<string, unknown> = {}): Row {
  return {
    _id: "user-target",
    email: "target@example.test",
    ...overrides,
  };
}

function organization(overrides: Record<string, unknown> = {}): Row {
  return {
    _id: "org-1",
    status: "active",
    planKey: "enterprise",
    ...overrides,
  };
}

const ownerMembership: Row = {
  _id: "membership-owner",
  organizationId: "org-1",
  userId: "owner-user",
  role: "owner",
  status: "active",
};

describe("secure organization invitation acceptance behavior", () => {
  beforeEach(() => {
    mocks.getAuthUserId.mockReset();
    mocks.getAuthUserId.mockResolvedValue("user-target" as any);
  });

  it("rejects legacy pre-binding invitations without creating or activating membership", async () => {
    const state = buildCtx({
      user: user(),
      invitation: invitation({ acceptedByUserId: undefined }),
      organization: organization(),
      memberships: [ownerMembership],
    });

    await expect(acceptInvitationHandler(state.ctx, { invitationId: "invite-1" as any }))
      .rejects.toThrow(/predates secure account binding/i);

    expect(state.inserts).toEqual([]);
    expect(state.patches).toEqual([]);
  });

  it("rejects an invitation bound to a different account with zero writes", async () => {
    const state = buildCtx({
      user: user(),
      invitation: invitation({ acceptedByUserId: "user-other" }),
      organization: organization(),
      memberships: [ownerMembership],
    });

    await expect(acceptInvitationHandler(state.ctx, { invitationId: "invite-1" as any }))
      .rejects.toThrow(/belongs to a different InventSmith account/i);

    expect(state.inserts).toEqual([]);
    expect(state.patches).toEqual([]);
  });

  it("rejects acceptance after the intended account email changes with zero writes", async () => {
    const state = buildCtx({
      user: user({ email: "changed@example.test" }),
      invitation: invitation(),
      organization: organization(),
      memberships: [ownerMembership],
    });

    await expect(acceptInvitationHandler(state.ctx, { invitationId: "invite-1" as any }))
      .rejects.toThrow(/email no longer matches the intended account/i);

    expect(state.inserts).toEqual([]);
    expect(state.patches).toEqual([]);
  });

  it("fails closed when the invitation email no longer uniquely resolves to the intended account", async () => {
    const state = buildCtx({
      user: user(),
      extraUsers: [{ _id: "duplicate-user", email: "target@example.test" }],
      invitation: invitation(),
      organization: organization(),
      memberships: [ownerMembership],
    });

    await expect(acceptInvitationHandler(state.ctx, { invitationId: "invite-1" as any }))
      .rejects.toThrow(/belongs to a different InventSmith account/i);

    expect(state.inserts).toEqual([]);
    expect(state.patches).toEqual([]);
  });

  it("expires an elapsed invitation but never creates membership", async () => {
    const state = buildCtx({
      user: user(),
      invitation: invitation({ expiresAt: Date.now() - 1 }),
      organization: organization(),
      memberships: [ownerMembership],
    });

    await expect(acceptInvitationHandler(state.ctx, { invitationId: "invite-1" as any }))
      .rejects.toThrow(/invitation has expired/i);

    expect(state.inserts).toEqual([]);
    expect(state.patches).toHaveLength(1);
    expect(state.patches[0]).toMatchObject({ id: "invite-1", value: { status: "expired" } });
  });

  it("rechecks the current seat limit before membership activation and performs zero writes when full", async () => {
    const state = buildCtx({
      user: user(),
      invitation: invitation(),
      organization: organization({ planKey: "explorer" }),
      memberships: [ownerMembership],
      invitations: [invitation()],
    });

    await expect(acceptInvitationHandler(state.ctx, { invitationId: "invite-1" as any }))
      .rejects.toThrow(/no longer has an available seat/i);

    expect(state.inserts).toEqual([]);
    expect(state.patches).toEqual([]);
  });

  it("creates membership only after all account, organization, expiry, and capacity guards pass", async () => {
    const state = buildCtx({
      user: user(),
      invitation: invitation({ role: "professional" }),
      organization: organization(),
      memberships: [ownerMembership],
      invitations: [invitation({ role: "professional" })],
    });

    const result = await acceptInvitationHandler(state.ctx, { invitationId: "invite-1" as any });

    expect(result).toEqual({ organizationId: "org-1", membershipId: "membership-new", role: "professional" });
    expect(state.inserts).toHaveLength(1);
    expect(state.inserts[0]).toMatchObject({
      table: "organizationMemberships",
      value: { organizationId: "org-1", userId: "user-target", role: "professional", status: "active" },
    });
    expect(state.patches).toHaveLength(1);
    expect(state.patches[0]).toMatchObject({
      id: "invite-1",
      value: { status: "accepted", acceptedByUserId: "user-target" },
    });
  });

  it("reactivates an existing non-active membership instead of inserting a duplicate", async () => {
    const existing: Row = {
      _id: "membership-existing",
      organizationId: "org-1",
      userId: "user-target",
      role: "viewer",
      status: "suspended",
    };
    const state = buildCtx({
      user: user(),
      invitation: invitation({ role: "member" }),
      organization: organization(),
      memberships: [ownerMembership, existing],
      invitations: [invitation({ role: "member" })],
    });

    const result = await acceptInvitationHandler(state.ctx, { invitationId: "invite-1" as any });

    expect(result).toEqual({ organizationId: "org-1", membershipId: "membership-existing", role: "member" });
    expect(state.inserts).toEqual([]);
    expect(state.patches).toHaveLength(2);
    expect(state.patches[0]).toMatchObject({ id: "membership-existing", value: { role: "member", status: "active" } });
    expect(state.patches[1]).toMatchObject({ id: "invite-1", value: { status: "accepted" } });
  });
});
