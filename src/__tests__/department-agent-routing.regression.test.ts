import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  DEPARTMENT_AGENT_PROFILES,
  departmentAgentAuditMetadata,
  departmentAgentSystemPrompt,
  resolveDepartmentAgent,
} from "@convex/departmentAgentLogic";
import { POST_CANONICAL_WORK_PLAN } from "@convex/fullProductWorkPlan";
import { SOFTWARE_PRODUCT_WORK_PLAN } from "@convex/softwareWorkPlan";

describe("dedicated department agent routing", () => {
  it("gives every department a unique stable agent identity", () => {
    const profiles = Object.values(DEPARTMENT_AGENT_PROFILES);
    expect(profiles.length).toBeGreaterThanOrEqual(21);
    expect(new Set(profiles.map((profile) => profile.department)).size).toBe(profiles.length);
    expect(new Set(profiles.map((profile) => profile.agentId)).size).toBe(profiles.length);
    expect(new Set(profiles.map((profile) => profile.name)).size).toBe(profiles.length);
    for (const profile of profiles) {
      expect(profile.agentId).toBe(`inventsmith.department.${profile.department}.v1`);
      expect(profile.mission.length).toBeGreaterThan(40);
      expect(profile.guardrails.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("routes every physical, hybrid, and software work-plan item to a registered agent", () => {
    for (const item of [...POST_CANONICAL_WORK_PLAN, ...SOFTWARE_PRODUCT_WORK_PLAN]) {
      const agent = resolveDepartmentAgent(item.inputSnapshot);
      expect(agent.department).toBe(item.inputSnapshot.department);
    }
    expect(resolveDepartmentAgent({ department: "canonical" }).agentId).toContain(".canonical.");
    expect(resolveDepartmentAgent({ department: "patent_readiness" }).agentId).toContain(".patent_readiness.");
    expect(resolveDepartmentAgent({ department: "canonical" }, "market_feasibility").department).toBe("market_research");
    expect(resolveDepartmentAgent({ department: "canonical" }, "patent_design_handoff").department).toBe("patent_readiness");
    expect(resolveDepartmentAgent({ department: "canonical" }, "regulatory_screening").department).toBe("regulatory");
  });

  it("fails closed before provider execution when a work item lacks a registered department", () => {
    expect(() => resolveDepartmentAgent(undefined)).toThrow(/missing a registered department agent/i);
    expect(() => resolveDepartmentAgent({ department: "generic" })).toThrow(/missing a registered department agent/i);
  });

  it("binds identity, mission, and guardrails into the model system prompt", () => {
    const agent = DEPARTMENT_AGENT_PROFILES.manufacturing;
    const prompt = departmentAgentSystemPrompt(agent);
    expect(prompt).toContain(agent.agentId);
    expect(prompt).toContain(agent.name);
    expect(prompt).toContain(agent.mission);
    expect(prompt).toContain("Do not contact suppliers");
  });

  it("records the selected department agent in execution audit metadata", () => {
    expect(departmentAgentAuditMetadata({ department: "pricing" })).toEqual(expect.objectContaining({
      departmentAgentRegistered: true,
      department: "pricing",
      departmentAgentId: DEPARTMENT_AGENT_PROFILES.pricing.agentId,
    }));
    expect(departmentAgentAuditMetadata({ department: "unknown" })).toEqual(expect.objectContaining({
      departmentAgentRegistered: false,
      department: "unknown",
    }));
  });

  it("enforces routing in both general work and native CAD provider paths", () => {
    const orchestration = readFileSync("convex/atlasWorkOrchestration.ts", "utf8");
    const nativeCad = readFileSync("convex/nativeCadGeneration.ts", "utf8");
    expect(orchestration).toContain("resolveDepartmentAgent(workItem.inputSnapshot, workItem.kind)");
    expect(orchestration).toContain("departmentAgentSystemPrompt(departmentAgent)");
    expect(nativeCad).toContain("resolveDepartmentAgent(context.workItem.inputSnapshot)");
    expect(nativeCad).toContain("departmentAgentSystemPrompt(departmentAgent)");
  });
});
