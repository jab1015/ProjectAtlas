import { canonicalWorkPlanForProductType } from "./canonicalWorkPlan";
import { POST_CANONICAL_WORK_PLAN, type FullProductWorkPlanItem } from "./fullProductWorkPlan";
import { SOFTWARE_PRODUCT_WORK_PLAN } from "./softwareWorkPlan";
import { workKindAppliesToProductType, type InventionClassification } from "./inventionClassificationLogic";

function cloneItem(item: FullProductWorkPlanItem): FullProductWorkPlanItem {
  return {
    ...item,
    dependsOnKinds: [...item.dependsOnKinds],
    inputSnapshot: { ...item.inputSnapshot },
  };
}

function pruneDependencies(items: FullProductWorkPlanItem[], availableKinds: Set<string>): FullProductWorkPlanItem[] {
  return items.map((item) => ({
    ...item,
    dependsOnKinds: item.dependsOnKinds.filter((kind) => availableKinds.has(kind)),
  }));
}

export function buildInventionWorkPlan(classification: InventionClassification) {
  const canonical = canonicalWorkPlanForProductType(classification.productType);
  const selectedPost = POST_CANONICAL_WORK_PLAN
    .filter((item) => workKindAppliesToProductType(item.kind, classification.productType))
    .map(cloneItem);

  if (classification.productType === "software" || classification.productType === "hybrid") {
    selectedPost.push(...SOFTWARE_PRODUCT_WORK_PLAN.map(cloneItem));
  }

  const availableKinds = new Set([
    ...canonical.map((item) => item.kind),
    ...selectedPost.map((item) => item.kind),
  ]);
  const postCanonical = pruneDependencies(selectedPost, availableKinds);
  return {
    canonical,
    postCanonical,
    totalCount: canonical.length + postCanonical.length,
    productType: classification.productType,
    supportClass: classification.supportClass,
  };
}
