import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("InventSmith support case workflow", () => {
  it("requires an authenticated reporter and validates any linked invention access", () => {
    const source = read("../../convex/supportCases.ts");
    const create = source.slice(source.indexOf("export const create"), source.indexOf("export const listMine"));
    expect(create).toContain("getAuthUserId(ctx)");
    expect(create).toContain("requireInventionReadAccess(ctx, args.inventionId)");
    expect(create).toContain("subject.length > 140");
    expect(create).toContain("description.length > 5000");
  });

  it("keeps reporter case reads private and reserves internal notes and updates for admins", () => {
    const source = read("../../convex/supportCases.ts");
    const mine = source.slice(source.indexOf("export const listMine"), source.indexOf("export const listForAdmin"));
    const adminList = source.slice(source.indexOf("export const listForAdmin"), source.indexOf("export const updateByAdmin"));
    const update = source.slice(source.indexOf("export const updateByAdmin"));
    expect(mine).toContain("by_userId_createdAt");
    expect(mine).toContain("adminNotes: _private");
    expect(adminList).toContain("await requireAdmin(ctx)");
    expect(adminList).toContain("linkedInvention");
    expect(update).toContain("await requireAdmin(ctx)");
    expect(update).toContain("updatedByAdminId");
  });

  it("makes the support desk discoverable and warns that case links do not grant invention access", () => {
    const admin = read("../app/(admin)/admin/support/page.tsx");
    const user = read("../app/(app)/support/page.tsx");
    const nav = read("../components/admin/admin-sidebar.tsx");
    expect(admin).toContain("Support cases");
    expect(admin).toContain("normal invention access controls");
    expect(user).toContain("Submit support case");
    expect(nav).toContain('href: "/admin/support"');
  });
});
