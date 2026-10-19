import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("pre-provider worker lease guards", () => {
  it("requires current attempt ownership and an unexpired lease before general provider execution", () => {
    const state = source("convex/atlasWorkState.ts");
    const orchestration = source("convex/atlasWorkOrchestration.ts");
    expect(state).toContain('workItem.status !== "running" || workItem.attemptCount !== attemptNumber');
    expect(state).toContain('workItem.leaseExpiresAt <= now');
    expect(state).toContain('lease expired before provider execution');
    expect(orchestration).toContain('attemptNumber, now: Date.now()');
    expect(orchestration.indexOf('ctx.runQuery(getWorkContext')).toBeLessThan(orchestration.indexOf('client.responses.create'));
  });

  it("rechecks native CAD ownership immediately before its provider call", () => {
    const state = source("convex/nativeCad.ts");
    const generation = source("convex/nativeCadGeneration.ts");
    expect(state).toContain('workItem.attemptCount !== args.attemptNumber');
    expect(state).toContain('workItem.leaseExpiresAt <= args.now');
    expect(state).toContain('Native CAD work attempt lease expired before provider execution');
    expect(generation).toContain('attemptNumber: args.attemptNumber, now: Date.now()');
    expect(generation.indexOf('ctx.runQuery(getNativeCadContext')).toBeLessThan(generation.indexOf('client.responses.create'));
  });
});
