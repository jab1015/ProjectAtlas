import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function typescriptFiles(root: string): string[] {
  const absolute = resolve(process.cwd(), root);
  const output: string[] = [];
  const visit = (directory: string) => {
    for (const name of readdirSync(directory)) {
      if (name === "_generated") continue;
      const path = join(directory, name);
      if (statSync(path).isDirectory()) visit(path);
      else if (path.endsWith(".ts")) output.push(path);
    }
  };
  visit(absolute);
  return output;
}

function occurrences(text: string, needle: string) {
  return text.split(needle).length - 1;
}

describe("InventSmith workspace and maturity source contract", () => {
  it("keeps every critical inventionWorkspace entry point and handler delegation intact exactly once", () => {
    const workspace = source("convex/inventionWorkspace.ts");
    const criticalExports = [
      "getWorkspaceState",
      "getStatusBriefing",
      "getReviewQueue",
      "getDeliverableLibrary",
      "getPilotEvaluation",
      "ensureInventionRecord",
      "kickAutonomousWork",
      "resolveDecision",
      "resolveApprovalRequest",
      "respondToBlockedWork",
      "recordProfessionalReview",
      "createDecision",
      "requestApproval",
    ];

    for (const exportName of criticalExports) {
      expect(occurrences(workspace, `export const ${exportName} =`), `${exportName} must exist exactly once`).toBe(1);
    }
    expect(workspace).toContain("handler: respondToBlockedWorkHandler");
    expect(workspace).toContain("handler: recordProfessionalReviewHandler");
    // Coarse truncation tripwire only. Exact exports/delegations above are the authoritative guard.
    expect(workspace.length).toBeGreaterThan(14_000);
  });

  it("keeps the generic completeWork caller unable to request engineering or manufacturing maturity", () => {
    const convexFiles = typescriptFiles("convex");
    const completeWorkReferences = convexFiles
      .map((path) => ({ path, text: readFileSync(path, "utf8") }))
      .filter(({ text }) => text.includes('"atlasWorkState:completeWork"'));

    expect(completeWorkReferences).toHaveLength(1);
    expect(completeWorkReferences[0].path.replaceAll("\\", "/")).toMatch(/convex\/atlasWorkOrchestration\.ts$/);

    const orchestration = completeWorkReferences[0].text;
    expect(orchestration).toContain('let artifactMaturity: "concept_visualization" | undefined;');
    expect(orchestration).toContain('artifactMaturity = "concept_visualization";');
    expect(orchestration).not.toContain('artifactMaturity = "engineering_reviewed"');
    expect(orchestration).not.toContain('artifactMaturity = "manufacturing_released"');
  });
});
