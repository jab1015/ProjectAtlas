export type OrganizationKind = "personal" | "company" | "studio";
export type OrganizationRole = "owner" | "admin" | "member" | "viewer" | "professional";
export type InventionAccess = "manage" | "edit" | "view" | "review";
export type OrganizationPlanKey =
  | "explorer"
  | "inventor"
  | "pro"
  | "enterprise"
  | "studio_3"
  | "studio_6"
  | "studio_custom";

export interface OrganizationPlanPolicy {
  key: OrganizationPlanKey;
  displayName: string;
  monthlyPriceUsd: number | null;
  activeInventionLimit: number | null;
  includedSeatLimit: number | null;
  completeJourney: boolean;
  professionalWorkspace: boolean;
}

/**
 * Commercial destination approved for the organization-native architecture.
 * `null` means custom/contracted rather than unlimited.
 * Compute/storage/premium-generation allowances are intentionally not hard-coded
 * here until production cost-to-serve measurements support a sustainable limit.
 */
export const ORGANIZATION_PLAN_POLICIES: Record<OrganizationPlanKey, OrganizationPlanPolicy> = {
  explorer: { key: "explorer", displayName: "Explorer", monthlyPriceUsd: 0, activeInventionLimit: 1, includedSeatLimit: 1, completeJourney: false, professionalWorkspace: false },
  inventor: { key: "inventor", displayName: "Inventor", monthlyPriceUsd: 39, activeInventionLimit: 1, includedSeatLimit: 1, completeJourney: false, professionalWorkspace: false },
  pro: { key: "pro", displayName: "Pro", monthlyPriceUsd: 99, activeInventionLimit: 1, includedSeatLimit: 1, completeJourney: true, professionalWorkspace: false },
  enterprise: { key: "enterprise", displayName: "Enterprise", monthlyPriceUsd: 199, activeInventionLimit: 2, includedSeatLimit: 3, completeJourney: true, professionalWorkspace: true },
  studio_3: { key: "studio_3", displayName: "Studio 3", monthlyPriceUsd: 299, activeInventionLimit: 3, includedSeatLimit: 5, completeJourney: true, professionalWorkspace: true },
  studio_6: { key: "studio_6", displayName: "Studio 6", monthlyPriceUsd: 399, activeInventionLimit: 6, includedSeatLimit: 8, completeJourney: true, professionalWorkspace: true },
  studio_custom: { key: "studio_custom", displayName: "Studio Custom", monthlyPriceUsd: null, activeInventionLimit: null, includedSeatLimit: null, completeJourney: true, professionalWorkspace: true },
};

export function normalizeOrganizationPlanKey(value: unknown): OrganizationPlanKey {
  switch (value) {
    case "explorer":
    case "free": return "explorer";
    case "inventor":
    case "starter": return "inventor";
    case "pro":
    case "inventor_pro": return "pro";
    case "enterprise": return "enterprise";
    case "studio_3":
    case "studio_6":
    case "studio_custom": return value;
    default: return "explorer";
  }
}

export function getOrganizationPlanPolicy(value: unknown): OrganizationPlanPolicy {
  return ORGANIZATION_PLAN_POLICIES[normalizeOrganizationPlanKey(value)];
}

export function canCreateActiveInvention(plan: unknown, activeCount: number): boolean {
  const limit = getOrganizationPlanPolicy(plan).activeInventionLimit;
  if (limit === null) return true;
  return Math.max(0, activeCount) < limit;
}

export function canManageOrganization(role: OrganizationRole): boolean {
  return role === "owner" || role === "admin";
}

export function canManageBilling(role: OrganizationRole): boolean {
  return role === "owner";
}

/**
 * Professionals are organization members for seat/account administration but do
 * not inherit visibility into the invention portfolio. They must receive an
 * explicit inventionAccessGrant for each project they review.
 */
export function defaultInventionAccessForRole(role: OrganizationRole): InventionAccess | null {
  switch (role) {
    case "owner":
    case "admin": return "manage";
    case "member": return "edit";
    case "viewer": return "view";
    case "professional": return null;
  }
}

export function canReadInvention(access: InventionAccess): boolean {
  return access === "manage" || access === "edit" || access === "view" || access === "review";
}

export function canEditInvention(access: InventionAccess): boolean {
  return access === "manage" || access === "edit";
}

export function canManageInventionAccess(access: InventionAccess): boolean {
  return access === "manage";
}
