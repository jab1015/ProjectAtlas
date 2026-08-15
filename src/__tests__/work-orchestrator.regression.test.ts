import { describe, expect, it } from "vitest";
import {
  costUnitsFromTokens,
  selectNextWorkItem,
  shouldContinueAutonomousRun,
  shouldScheduleAutonomousRetry,
  shouldRetryWork,
} from "@convex/workOrchestratorLogic";

const work = (overrides: Partial<Parameters<typeof selectNextWorkItem>[0][number]> = {}) => ({
  _id: "work-1",
  status: "queued",
  priority: 50,
  createdAt: 1,
  attemptCount: 0,
  estimatedCostUnits: 5,
  ...overrides,
});

describe("autonomous work selection", () => {
  it("selects highest priority eligible work", () => {
    const result = selectNextWorkItem([work(), work({ _id: "urgent", priority: 90 })], 20, 100);
    expect(result.selected?._id).toBe("urgent");
  });

  it("does not start a second job while an active lease exists", () => {
    const result = selectNextWorkItem([work(), work({ status: "running", leaseExpiresAt: 200 })], 20, 100);
    expect(result.reason).toBe("already_running");
  });

  it("recovers work after a lease expires", () => {
    const result = selectNextWorkItem([work({ status: "running", leaseExpiresAt: 99 })], 20, 100);
    expect(result.reason).toBe("selected");
  });

  it("blocks work that exceeds the available budget", () => {
    const result = selectNextWorkItem([work({ estimatedCostUnits: 21 })], 20, 100);
    expect(result.reason).toBe("budget_exceeded");
  });

  it("uses a lower-priority affordable task when the first task exceeds budget", () => {
    const expensive = work({ _id: "expensive", priority: 90, estimatedCostUnits: 21 });
    const affordable = work({ _id: "affordable", priority: 80, estimatedCostUnits: 5 });
    expect(selectNextWorkItem([expensive, affordable], 20, 100).selected?._id).toBe("affordable");
  });

  it("waits until every declared dependency is complete", () => {
    const blocked = work({ _id: "dependent", kind: "market", dependsOnKinds: ["competitors"] });
    expect(selectNextWorkItem([blocked], 20, 100).reason).toBe("no_eligible_work");
    const dependency = work({ _id: "dependency", kind: "competitors", status: "completed" });
    expect(selectNextWorkItem([blocked, dependency], 20, 100).selected?._id).toBe("dependent");
  });
});

describe("autonomous work retry and cost controls", () => {
  it("stops after the configured attempt limit", () => {
    expect(shouldRetryWork(2, 3)).toBe(true);
    expect(shouldRetryWork(3, 3)).toBe(false);
  });

  it("rounds token usage into auditable cost units", () => {
    expect(costUnitsFromTokens(1001)).toBe(2);
    expect(costUnitsFromTokens(undefined)).toBe(0);
  });

  it("continues bounded work turns only while budget remains", () => {
    expect(shouldContinueAutonomousRun("turn_limit", 5)).toBe(true);
    expect(shouldContinueAutonomousRun("turn_limit", 0)).toBe(false);
    expect(shouldContinueAutonomousRun("human_gate", 5)).toBe(false);
    expect(shouldContinueAutonomousRun("failed", 5)).toBe(false);
  });

  it("automatically retries only retryable failures with budget", () => {
    expect(shouldScheduleAutonomousRetry(true, 5)).toBe(true);
    expect(shouldScheduleAutonomousRetry(false, 5)).toBe(false);
    expect(shouldScheduleAutonomousRetry(true, 0)).toBe(false);
  });
});
