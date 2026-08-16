import { describe, expect, it } from "vitest";
import {
  ORGANIZATION_PLAN_POLICIES,
  canCreateActiveInvention,
  canEditInvention,
  canManageBilling,
  canManageInventionAccess,
  canManageOrganization,
  canReadInvention,
  defaultInventionAccessForRole,
  normalizeOrganizationPlanKey,
} from "../../convex/organizationPolicyLogic";

describe("InventSmith organization-native policy", () => {
  it("keeps the approved commercial destination explicit without promising unlimited usage", () => {
    expect(ORGANIZATION_PLAN_POLICIES.explorer.monthlyPriceUsd).toBe(0);
    expect(ORGANIZATION_PLAN_POLICIES.inventor.monthlyPriceUsd).toBe(39);
    expect(ORGANIZATION_PLAN_POLICIES.pro.monthlyPriceUsd).toBe(99);
    expect(ORGANIZATION_PLAN_POLICIES.enterprise.monthlyPriceUsd).toBe(199);
    expect(ORGANIZATION_PLAN_POLICIES.studio_3.monthlyPriceUsd).toBe(299);
    expect(ORGANIZATION_PLAN_POLICIES.studio_6.monthlyPriceUsd).toBe(399);
    expect(ORGANIZATION_PLAN_POLICIES.studio_custom.monthlyPriceUsd).toBeNull();
    expect(ORGANIZATION_PLAN_POLICIES.studio_custom.activeInventionLimit).toBeNull();
  });

  it("locks the intended active-invention and included-seat ladder", () => {
    expect(ORGANIZATION_PLAN_POLICIES.explorer).toMatchObject({ activeInventionLimit: 1, includedSeatLimit: 1 });
    expect(ORGANIZATION_PLAN_POLICIES.inventor).toMatchObject({ activeInventionLimit: 1, includedSeatLimit: 1 });
    expect(ORGANIZATION_PLAN_POLICIES.pro).toMatchObject({ activeInventionLimit: 1, includedSeatLimit: 1 });
    expect(ORGANIZATION_PLAN_POLICIES.enterprise).toMatchObject({ activeInventionLimit: 2, includedSeatLimit: 3 });
    expect(ORGANIZATION_PLAN_POLICIES.studio_3).toMatchObject({ activeInventionLimit: 3, includedSeatLimit: 5 });
    expect(ORGANIZATION_PLAN_POLICIES.studio_6).toMatchObject({ activeInventionLimit: 6, includedSeatLimit: 8 });
  });

  it("preserves legacy tier aliases during migration", () => {
    expect(normalizeOrganizationPlanKey("free")).toBe("explorer");
    expect(normalizeOrganizationPlanKey("starter")).toBe("inventor");
    expect(normalizeOrganizationPlanKey("inventor_pro")).toBe("pro");
    expect(normalizeOrganizationPlanKey("enterprise")).toBe("enterprise");
  });

  it("treats archived inventions as outside the active-slot count supplied to policy", () => {
    expect(canCreateActiveInvention("explorer", 0)).toBe(true);
    expect(canCreateActiveInvention("explorer", 1)).toBe(false);
    expect(canCreateActiveInvention("pro", 0)).toBe(true);
    expect(canCreateActiveInvention("pro", 1)).toBe(false);
    expect(canCreateActiveInvention("enterprise", 1)).toBe(true);
    expect(canCreateActiveInvention("enterprise", 2)).toBe(false);
    expect(canCreateActiveInvention("studio_3", 2)).toBe(true);
    expect(canCreateActiveInvention("studio_3", 3)).toBe(false);
  });

  it("separates organization authority from invention-level access", () => {
    expect(canManageOrganization("owner")).toBe(true);
    expect(canManageOrganization("admin")).toBe(true);
    expect(canManageOrganization("professional")).toBe(false);
    expect(canManageBilling("owner")).toBe(true);
    expect(canManageBilling("admin")).toBe(false);

    expect(defaultInventionAccessForRole("professional")).toBeNull();
    expect(defaultInventionAccessForRole("viewer")).toBe("view");
    expect(defaultInventionAccessForRole("member")).toBe("edit");
    expect(canReadInvention("review")).toBe(true);
    expect(canEditInvention("review")).toBe(false);
    expect(canManageInventionAccess("edit")).toBe(false);
    expect(canManageInventionAccess("manage")).toBe(true);
  });
});
