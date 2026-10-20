import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getNextUnmetWorkDependencies } from "@/lib/departmentWorkStatus";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("department prerequisite visibility", () => {
  it("reports the next queued item's incomplete dependencies", () => {
    const work = [
      { kind: "prototype_strategy", status: "queued", dependsOnKinds: ["product_design_specification"] },
      { kind: "prototype_sourcing_plan", status: "queued", dependsOnKinds: ["prototype_strategy", "native_cad_generation"] },
    ];
    expect(getNextUnmetWorkDependencies(work, [])).toEqual(["product_design_specification"]);
    expect(getNextUnmetWorkDependencies(work, ["product_design_specification"])).toEqual([]);
    expect(getNextUnmetWorkDependencies(work.map((item) => ({ ...item, status: "running" })), [])).toEqual([]);
  });

  it("returns completed dependency kinds from the invention record and renders the gate", () => {
    const query = read("convex/lifecycleDepartments.ts");
    const page = read("src/app/(app)/invention/[id]/department/[stageId]/page.tsx");
    expect(query).toContain('completedWorkKinds: workItems.filter((item: any) => item.status === "completed").map((item: any) => item.kind)');
    expect(page).toContain("getNextUnmetWorkDependencies(departmentWork, department?.completedWorkKinds ?? [])");
    expect(page).toContain("Waiting for prerequisite work");
    expect(page).toContain("Open Product Design + CAD");
    expect(page).toContain("Queued or running");
  });
});
