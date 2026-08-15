import { DESIGN_WORK } from "./productDesign";
import { lifecycleStages } from "./lifecycleDepartments";

export interface FullProductWorkPlanItem {
  kind: string;
  title: string;
  priority: number;
  estimatedCostUnits: number;
  deliverableKind: string;
  dependsOnKinds: string[];
  inputSnapshot: Record<string, unknown>;
}

const designWork: FullProductWorkPlanItem[] = DESIGN_WORK.map((item) => ({
  kind: item.kind,
  title: item.title,
  priority: item.priority,
  estimatedCostUnits: item.estimatedCostUnits,
  deliverableKind: item.deliverableKind,
  dependsOnKinds: [...item.dependsOnKinds],
  inputSnapshot: {
    department: "product_design",
    instructions: item.instructions,
  },
}));

const nativeCadWork: FullProductWorkPlanItem = {
  kind: "native_cad_generation",
  title: "Generate native STEP, STL, DXF and editable CAD source",
  priority: 63,
  estimatedCostUnits: 18,
  deliverableKind: "native_cad_package",
  dependsOnKinds: ["product_design_specification", "cad_model_specification", "manufacturing_drawing_specification"],
  inputSnapshot: {
    department: "product_design",
    executionMode: "native_cad",
    instructions: "Generate the next preliminary native CAD package automatically when the selected design, CAD specification, and drawing requirements are ready. Produce STEP/STL/DXF/editable source plus orthographic and exploded views. Preserve every unresolved engineering assumption and require qualified engineering/prototype review before manufacturing release.",
  },
};

const lifecycleWork: FullProductWorkPlanItem[] = lifecycleStages.flatMap((stage) =>
  stage.work.map((item) => ({
    kind: item.kind,
    title: item.title,
    priority: item.priority,
    estimatedCostUnits: item.estimatedCostUnits,
    deliverableKind: item.deliverableKind,
    dependsOnKinds: [...item.dependsOnKinds],
    inputSnapshot: {
      department: stage.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
      stageId: stage.id,
      instructions: item.instructions,
      research: item.research === true,
      professionalGate: item.professionalGate ?? null,
    },
  }))
);

export const POST_CANONICAL_WORK_PLAN: readonly FullProductWorkPlanItem[] = [
  ...designWork,
  nativeCadWork,
  ...lifecycleWork,
];

export const FULL_PRODUCT_AUTONOMOUS_WORK_KINDS = new Set(POST_CANONICAL_WORK_PLAN.map((item) => item.kind));
