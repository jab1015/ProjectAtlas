import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../convex/organizations", () => ({
  requireOrganizationRole: vi.fn(),
  getOrganizationMembership: vi.fn(),
}));

import { getOrganizationMembership, requireOrganizationRole } from "../../convex/organizations";
import { transferOwnershipHandler } from "../../convex/organizationOwnership";

const mockedRequireOrganizationRole = vi.mocked(requireOrganizationRole);
const mockedGetOrganizationMembership = vi.mocked(getOrganizationMembership);

type Row = Record<string, any> & { _id: string };

function buildState(organization: Row | null) {
  const patches: Array<{ id: string; value: Record<string, unknown> }> = [];
  const ctx = {
    db: {
      get: vi.fn(async () => organization),
      patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
        patches.push({ id: String(id), value });
      }),
    },
  } as any;
  return { ctx, patches };
}

describe("organization ownership transfer behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRequireOrganizationRole.mockResolvedValue({
      userId: "user-owner" as any,
      membership: { _id: "membership-owner", role: "owner", status: "active" } as any,
    });
  });

  it("treats transfer to the existing owner as idempotent and performs zero writes", async () => {
    const state = buildState({ _id: "org-company", kind: "company", status: "active" });

    await expect(
      transferOwnershipHandler(state.ctx, {
        organizationId: "org-company" as any,
        newOwnerUserId: "user-owner" as any,
      }),
    ).resolves.toEqual({ transferred: false, reason: "already_owner" });

    expect(state.ctx.db.get).not.toHaveBeenCalled();
    expect(mockedGetOrganizationMembership).not.toHaveBeenCalled();
    expect(state.patches).toEqual([]);
  });

  it("rejects personal-organization transfer before target lookup or writes", async () => {
    const state = buildState({ _id: "org-personal", kind: "personal", status: "active" });

    await expect(
      transferOwnershipHandler(state.ctx, {
        organizationId: "org-personal" as any,
        newOwnerUserId: "user-target" as any,
      }),
    ).rejects.toThrow(/Personal InventSmith ownership cannot be transferred/i);

    expect(mockedGetOrganizationMembership).not.toHaveBeenCalled();
    expect(state.patches).toEqual([]);
  });

  it("rejects a missing, removed, or suspended target member with zero writes", async () => {
    for (const targetMembership of [
      null,
      { _id: "membership-target", role: "member", status: "removed" },
      { _id: "membership-target", role: "member", status: "suspended" },
    ]) {
      vi.clearAllMocks();
      mockedRequireOrganizationRole.mockResolvedValue({
        userId: "user-owner" as any,
        membership: { _id: "membership-owner", role: "owner", status: "active" } as any,
      });
      mockedGetOrganizationMembership.mockResolvedValue(targetMembership as any);
      const state = buildState({ _id: "org-company", kind: "company", status: "active" });

      await expect(
        transferOwnershipHandler(state.ctx, {
          organizationId: "org-company" as any,
          newOwnerUserId: "user-target" as any,
        }),
      ).rejects.toThrow(/new owner must already be an active organization member/i);

      expect(state.patches).toEqual([]);
    }
  });

  it("moves ownership atomically across the two memberships and organization owner reference", async () => {
    mockedGetOrganizationMembership.mockResolvedValue({
      _id: "membership-target",
      role: "admin",
      status: "active",
    } as any);
    const state = buildState({ _id: "org-company", kind: "company", status: "active" });

    const result = await transferOwnershipHandler(state.ctx, {
      organizationId: "org-company" as any,
      newOwnerUserId: "user-target" as any,
    });

    expect(result).toEqual({
      transferred: true,
      organizationId: "org-company",
      previousOwnerUserId: "user-owner",
      newOwnerUserId: "user-target",
    });
    expect(state.patches).toHaveLength(3);
    expect(state.patches[0]).toMatchObject({ id: "membership-owner", value: { role: "admin" } });
    expect(state.patches[1]).toMatchObject({ id: "membership-target", value: { role: "owner" } });
    expect(state.patches[2]).toMatchObject({
      id: "org-company",
      value: { createdByUserId: "user-target" },
    });
  });
});
