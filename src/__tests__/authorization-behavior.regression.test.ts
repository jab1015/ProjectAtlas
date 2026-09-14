import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({ userId: null as string | null }));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: vi.fn(async () => authState.userId),
}));

import {
  requireInventionEditAccess,
  requireInventionManageAccess,
  requireInventionReadAccess,
  resolveInventionAccess,
} from "../../convex/organizations";
import { canTierRunWorkKind } from "../../convex/entitlementPolicyLogic";

type Row = Record<string, unknown> & { _id?: string };

function fakeCtx(args?: {
  inventions?: Record<string, Row>;
  memberships?: Row[];
  grants?: Row[];
}) {
  const inventions = args?.inventions ?? {};
  const memberships = args?.memberships ?? [];
  const grants = args?.grants ?? [];

  return {
    db: {
      get: vi.fn(async (id: string) => inventions[id] ?? null),
      query: vi.fn((table: string) => ({
        withIndex: (_index: string, apply: (q: any) => any) => {
          const filters: Record<string, unknown> = {};
          const q = {
            eq(field: string, value: unknown) {
              filters[field] = value;
              return q;
            },
          };
          apply(q);
          return {
            first: async () => {
              const rows = table === "organizationMemberships" ? memberships : grants;
              return (
                rows.find((row) =>
                  Object.entries(filters).every(([field, value]) => row[field] === value)
                ) ?? null
              );
            },
          };
        },
      })),
    },
  } as any;
}

describe("invention authorization behavior", () => {
  beforeEach(() => {
    authState.userId = null;
  });

  it("denies unauthenticated invention access", async () => {
    const ctx = fakeCtx({
      inventions: { inv1: { _id: "inv1", userId: "owner1" } },
    });

    await expect(requireInventionReadAccess(ctx, "inv1" as any)).rejects.toThrow(
      "Authentication required"
    );
  });

  it("denies a different user access to a legacy owner-only invention", async () => {
    authState.userId = "user2";
    const ctx = fakeCtx({
      inventions: { inv1: { _id: "inv1", userId: "owner1" } },
    });

    await expect(requireInventionReadAccess(ctx, "inv1" as any)).rejects.toThrow(
      "Invention access required"
    );
  });

  it("allows the legacy owner to read, edit, and manage", async () => {
    authState.userId = "owner1";
    const ctx = fakeCtx({
      inventions: { inv1: { _id: "inv1", userId: "owner1" } },
    });

    await expect(requireInventionReadAccess(ctx, "inv1" as any)).resolves.toMatchObject({ access: "manage" });
    await expect(requireInventionEditAccess(ctx, "inv1" as any)).resolves.toMatchObject({ access: "manage" });
    await expect(requireInventionManageAccess(ctx, "inv1" as any)).resolves.toMatchObject({ access: "manage" });
  });

  it("requires active organization membership even when a stale explicit grant exists", async () => {
    const ctx = fakeCtx({
      inventions: {
        inv1: { _id: "inv1", userId: "owner1", organizationId: "org1" },
      },
      memberships: [
        { organizationId: "org1", userId: "user2", role: "member", status: "suspended" },
      ],
      grants: [
        { inventionId: "inv1", userId: "user2", access: "manage" },
      ],
    });

    await expect(resolveInventionAccess(ctx, "inv1" as any, "user2" as any)).resolves.toBeNull();
  });

  it("lets an active viewer read but not edit or manage", async () => {
    authState.userId = "viewer1";
    const ctx = fakeCtx({
      inventions: {
        inv1: { _id: "inv1", userId: "owner1", organizationId: "org1" },
      },
      memberships: [
        { organizationId: "org1", userId: "viewer1", role: "viewer", status: "active" },
      ],
    });

    await expect(requireInventionReadAccess(ctx, "inv1" as any)).resolves.toMatchObject({ access: "read" });
    await expect(requireInventionEditAccess(ctx, "inv1" as any)).rejects.toThrow("Invention edit access required");
    await expect(requireInventionManageAccess(ctx, "inv1" as any)).rejects.toThrow("Invention management access required");
  });

  it("honors an active member's explicit edit grant but still denies management", async () => {
    authState.userId = "member1";
    const ctx = fakeCtx({
      inventions: {
        inv1: { _id: "inv1", userId: "owner1", organizationId: "org1" },
      },
      memberships: [
        { organizationId: "org1", userId: "member1", role: "member", status: "active" },
      ],
      grants: [
        { inventionId: "inv1", userId: "member1", access: "edit" },
      ],
    });

    await expect(requireInventionEditAccess(ctx, "inv1" as any)).resolves.toMatchObject({ access: "edit" });
    await expect(requireInventionManageAccess(ctx, "inv1" as any)).rejects.toThrow("Invention management access required");
  });
});

describe("backend entitlement behavior", () => {
  it("does not grant paid lifecycle work to the Explorer tier", () => {
    expect(canTierRunWorkKind("explorer", "product_requirements")).toBe(false);
  });

  it("allows an entitled tier to execute applicable lifecycle work", () => {
    expect(canTierRunWorkKind("pro", "product_requirements")).toBe(true);
  });
});
