import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

describe("self-service profile name editing", () => {
  it("saves only the authenticated user's validated profile name", () => {
    const backend = fs.readFileSync(path.join(root, "convex/users.ts"), "utf8");
    expect(backend).toContain("export const updateMyProfileName = mutation");
    expect(backend).toContain("const userId = await getAuthUserId(ctx)");
    expect(backend).toContain("const name = args.name.trim()");
    expect(backend).toContain("Name must be between 1 and 80 characters");
    expect(backend).toContain("await ctx.db.patch(userId, { name })");
    expect(backend).not.toContain("targetUserId: v.id(\"users\")");
  });

  it("shows an editable name field and save control on the account page", () => {
    const page = fs.readFileSync(path.join(root, "src/app/(app)/account/page.tsx"), "utf8");
    expect(page).toContain('id="profile-name"');
    expect(page).toContain("Save profile name");
    expect(page).toContain("api.users.updateMyProfileName");
    expect(page).toContain("Save workspace name");
  });
});
