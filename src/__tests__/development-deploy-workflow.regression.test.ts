import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(join(process.cwd(), ".github", "workflows", "atlas-convex-development-deploy.yml"), "utf8");

describe("InventSmith Convex development deployment workflow", () => {
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

  it("verifies the app and operational scripts before calling Convex deploy", () => {
    const scriptCheckIndex = workflow.indexOf("node --check scripts/verify-live-deployment.mjs");
    const testIndex = workflow.indexOf("run: npm test");
    const auditIndex = workflow.indexOf("npm audit --omit=dev --audit-level=high");
    const deployIndex = workflow.indexOf("run: npx convex deploy");
    expect(scriptCheckIndex).toBeGreaterThan(0);
    expect(testIndex).toBeGreaterThan(scriptCheckIndex);
    expect(auditIndex).toBeGreaterThan(testIndex);
    expect(deployIndex).toBeGreaterThan(auditIndex);
  });

  it("records the full post-deploy verification boundary instead of claiming backend deployment completes acceptance", () => {
    expect(workflow).toContain("InventSmith Convex development deployment completed.");
    expect(workflow).toContain("npm run verify:live -- https://<deployment>.convex.site https://<inventsmith-app>");
    expect(workflow).toContain("authenticated session persistence and representative inventor workflows still require live browser acceptance");
  });
});
