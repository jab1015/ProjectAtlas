type WorkStatusInput = {
  kind: string;
  status: string;
  dependsOnKinds?: string[];
};

export function getNextUnmetWorkDependencies<T extends WorkStatusInput>(
  workItems: T[],
  completedWorkKinds: string[]
): string[] {
  const nextQueued = workItems.find((item) => item.status === "queued");
  if (!nextQueued) return [];

  const completed = new Set(completedWorkKinds);
  return (nextQueued.dependsOnKinds ?? []).filter((kind) => !completed.has(kind));
}
