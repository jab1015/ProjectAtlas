import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(join(process.cwd(), ".github", "workflows", "atlas-convex-development-deploy.yml"), "utf8");

describe("Atlas Convex development deployment workflow", () => {
  it("is manual-only and requires explicit confirmation", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toMatch(/\npush:\s*$/m);
    expect(workflow).toContain("DEPLOY ATLAS DEV");
  });

  it("rejects missing or non-development deploy keys", () => {
    expect(workflow).toContain("CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}");
    expect(workflow).toContain('if [[ -z "$CONVEX_DEPLOY_KEY" ]]');
    expect(workflow).toContain('if [[ "$CONVEX_DEPLOY_KEY" != dev:* ]]');
  });

  it("verifies the app before calling Convex deploy", () => {
    const testIndex = workflow.indexOf("run: npm test");
    const auditIndex = workflow.indexOf("npm audit --omit=dev --audit-level=high");
    const deployIndex = workflow.indexOf("run: npx convex deploy");
    expect(testIndex).toBeGreaterThan(0);
    expect(auditIndex).toBeGreaterThan(testIndex);
    expect(deployIndex).toBeGreaterThan(auditIndex);
  });
});
