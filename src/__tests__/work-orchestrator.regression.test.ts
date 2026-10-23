import { describe, expect, it } from "vitest";
import {
  costUnitsFromTokens,
  selectNextWorkItem,
  shouldContinueAutonomousRun,
  shouldScheduleAutonomousRetry,
  shouldRetryWork,
} from "@convex/workOrchestratorLogic";
import { canRunProductDesignWork, hasAcceptedPatentDesignReview } from "@convex/patentDesignGateLogic";

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

  it("fills available worker slots while respecting the parallel cap", () => {
    const result = selectNextWorkItem([work(), work({ status: "running", leaseExpiresAt: 200 })], 20, 100);
    expect(result.reason).toBe("selected");
    const atCapacity = selectNextWorkItem([
      work(),
      work({ _id: "running-1", status: "running", leaseExpiresAt: 200 }),
      work({ _id: "running-2", status: "running", leaseExpiresAt: 200 }),
      work({ _id: "running-3", status: "running", leaseExpiresAt: 200 }),
    ], 20, 100);
    expect(atCapacity.reason).toBe("already_running");
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

  it("scopes a department run to that stage while retaining invention-wide concurrency limits", () => {
    const stageFive = work({ _id: "cad", inputSnapshot: { stageId: 5 } });
    const stageSix = work({ _id: "prototype", priority: 99, inputSnapshot: { departmentStageId: 6 } });
    expect(selectNextWorkItem([stageFive, stageSix], 20, 100, undefined, undefined, undefined, 5).selected?._id).toBe("cad");
    expect(selectNextWorkItem([stageFive, stageSix], 20, 100, undefined, undefined, undefined, 6).selected?._id).toBe("prototype");
    expect(selectNextWorkItem([
      stageFive,
      stageSix,
      work({ _id: "running-1", status: "running", leaseExpiresAt: 200 }),
      work({ _id: "running-2", status: "running", leaseExpiresAt: 200 }),
      work({ _id: "running-3", status: "running", leaseExpiresAt: 200 }),
    ], 20, 100, undefined, undefined, undefined, 5).reason).toBe("already_running");
  });

  it("requires accepted Internal Legal review before Product Design work can run", () => {
    expect(hasAcceptedPatentDesignReview("handoff-1", [{ deliverableId: "handoff-1", specialty: "patent", status: "required" }])).toBe(false);
    expect(canRunProductDesignWork("design_candidate_generation", false)).toBe(false);
    expect(hasAcceptedPatentDesignReview("handoff-1", [{ deliverableId: "handoff-1", specialty: "patent", status: "accepted" }])).toBe(true);
    expect(canRunProductDesignWork("design_candidate_generation", true)).toBe(true);
    expect(canRunProductDesignWork("competitor_discovery", false)).toBe(true);
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
