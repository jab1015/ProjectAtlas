import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getDepartmentStartMessage } from "@/lib/departmentStartMessage";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("department start feedback", () => {
  it("distinguishes a queued worker check from work actually starting", () => {
    expect(getDepartmentStartMessage("Prototype", 0, true)).toContain("queued a background check");
    expect(getDepartmentStartMessage("Prototype", 0, true)).not.toContain("started the next eligible work");
    expect(getDepartmentStartMessage("Prototype", 0, false)).toContain("waiting for its next dependency");
    expect(getDepartmentStartMessage("Prototype", 7, false)).toContain("7 new work items");
    expect(getDepartmentStartMessage("Prototype", 7, false)).not.toContain("started the next eligible work");
    expect(getDepartmentStartMessage("Prototype", 7, true)).toContain("queued a background check");
  });

  it("uses scheduler feedback in both department launch flows", () => {
    const departmentPage = read("src/app/(app)/invention/[id]/department/[stageId]/page.tsx");
    const designPage = read("src/app/(app)/invention/[id]/design/page.tsx");
    expect(departmentPage).toContain("getDepartmentStartMessage(ensured.stageName, ensured.created, scheduled.scheduled)");
    expect(designPage).toContain('getDepartmentStartMessage("Product Design", ensured.created, scheduled.scheduled)');
  });
});
