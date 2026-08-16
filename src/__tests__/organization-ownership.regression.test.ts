import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "convex/organizationOwnership.ts"), "utf8");
const page = readFileSync(join(process.cwd(), "src/app/(app)/organizations/page.tsx"), "utf8");

describe("organization ownership transfer", () => {
  it("requires the current owner and an existing active member", () => {
    expect(source).toContain('requireOrganizationRole(\n      ctx,\n      args.organizationId,\n      ["owner"]');
    expect(source).toContain("targetMembership.status !== \"active\"");
    expect(source).toContain("The new owner must already be an active organization member");
  });

  it("does not allow personal organizations to transfer ownership", () => {
    expect(source).toContain('organization.kind === "personal"');
    expect(source).toContain("Personal InventSmith ownership cannot be transferred");
  });

  it("does not gate ownership transfer on daily usage now that usage is organization-keyed", () => {
    expect(source).toContain("Usage reservations are now keyed directly by organization + UTC day");
    expect(source).not.toContain('query("atlasDailyUsage")');
    expect(source).not.toContain("resets at 00:00 UTC");
  });

  it("moves the compatibility billing contact and demotes the previous owner to admin", () => {
    expect(source).toContain('{ role: "admin", updatedAt: now }');
    expect(source).toContain('{ role: "owner", updatedAt: now }');
    expect(source).toContain("createdByUserId: args.newOwnerUserId");
    expect(source).toContain("Usage no longer depends on this field");
  });

  it("exposes ownership transfer only from the owner-facing company/studio team UI and requires confirmation", () => {
    expect(page).toContain("organizationOwnership:transferOwnership");
    expect(page).toContain('selected.role !== "owner"');
    expect(page).toContain('selected.kind === "personal"');
    expect(page).toContain("window.confirm");
    expect(page).toContain("Transfer ownership");
  });
});
