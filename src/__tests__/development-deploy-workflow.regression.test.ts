import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(join(process.cwd(), ".github", "workflows", "inventsmith-convex-development-deploy.yml"), "utf8");
const netlifyConfig = readFileSync(join(process.cwd(), "netlify.toml"), "utf8");
const vercelConfig = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8")) as { buildCommand?: string };
const packageConfig = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as { scripts?: { build?: string } };

describe("InventSmith Convex development deployment workflow", () => {
  it("keeps all Netlify builds from deploying Convex", () => {
    const buildCommands = Array.from(netlifyConfig.matchAll(/^\s*command\s*=\s*"([^"]+)"/gm), (match) => match[1]);
    expect(buildCommands.length).toBeGreaterThan(0);
    expect(buildCommands.every((command) => command === "npx next build")).toBe(true);
    expect(buildCommands.every((command) => !/\bconvex\b/i.test(command))).toBe(true);
    expect(netlifyConfig).toContain('[context.deploy-preview]');
    expect(netlifyConfig).toContain('command = "npx next build"');
  });

  it("keeps Vercel preview builds website-only so they cannot upload Convex functions", () => {
    expect(vercelConfig.buildCommand).toBe("npx next build");
    expect(vercelConfig.buildCommand).not.toMatch(/convex/i);
    expect(packageConfig.scripts?.build).toBe("next build");
    expect(packageConfig.scripts?.build).not.toMatch(/convex/i);
  });

  it("is manual-only and requires explicit confirmation", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toMatch(/\npush:\s*$/m);
    expect(workflow).toContain("DEPLOY INVENTSMITH DEV");
  });

  it("rejects missing and production-scoped deploy keys for this test-only workflow", () => {
    expect(workflow).toContain("CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}");
    expect(workflow).toContain('if [[ -z "$CONVEX_DEPLOY_KEY" ]]');
    expect(workflow).toContain('if [[ "$CONVEX_DEPLOY_KEY" == prod:* ]]');
    expect(workflow).toContain('if [[ "$CONVEX_DEPLOY_KEY" != dev:* ]]');
    expect(workflow).toContain("quick-fox-785");
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
