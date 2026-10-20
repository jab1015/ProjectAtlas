export function getDepartmentStartMessage(
  stageName: string,
  created: number,
  scheduled: boolean
): string {
  if (scheduled) {
    return created > 0
      ? `${stageName} opened with ${created} new work items. InventSmith queued a background check for eligible work.`
      : `${stageName} is already initialized. InventSmith queued a background check for eligible work.`;
  }

  return created > 0
    ? `${stageName} opened with ${created} new work items. The department is ready; dependencies or usage controls currently prevent another autonomous run.`
    : `${stageName} is initialized and waiting for its next dependency, evidence, approval, professional review, physical task, or usage capacity.`;
}
