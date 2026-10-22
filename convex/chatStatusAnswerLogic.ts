interface StatusWorkItem {
  kind: string;
  title?: string;
  status: string;
  blockedReason?: string;
  lastError?: string;
}

interface StatusStage {
  id: number;
  name: string;
}

export function isLiveStatusQuestion(question: string) {
  return /\b(current status|what(?:'s| is) going on|working on now|what.*(?:working|doing).*now|status of my invention|what do i need to do today)\b/i.test(question);
}

export function buildLiveStatusAnswer(
  question: string,
  inventionTitle: string,
  currentStageId: number,
  stages: StatusStage[],
  workItems: StatusWorkItem[],
) {
  if (!isLiveStatusQuestion(question)) return null;
  const stage = stages.find((item) => item.id === currentStageId);
  const running = workItems.filter((item) => item.status === "running");
  const queued = workItems.filter((item) => item.status === "queued");
  const failed = workItems.filter((item) => item.status === "failed");
  const blocked = workItems.filter((item) => ["blocked", "awaiting_approval"].includes(item.status));
  const completed = workItems.filter((item) => item.status === "completed");
  const format = (items: StatusWorkItem[]) => items.slice(0, 5).map((item) => item.title || item.kind).join(", ");

  return [
    `Here is the live status for ${inventionTitle}.`,
    `Current stage: Stage ${currentStageId} — ${stage?.name ?? "Invention work"}.`,
    `Work ledger: ${running.length} running, ${queued.length} queued, ${blocked.length} waiting for a decision or review, ${failed.length} failed, and ${completed.length} completed.`,
    running.length ? `InventSmith is working on: ${format(running)}.` : "InventSmith is not actively running a work item at this moment.",
    queued.length ? `Next queued work: ${format(queued)}${queued.length > 5 ? `, plus ${queued.length - 5} more.` : "."}` : "There is no queued work.",
    failed.length ? `Needs recovery: ${format(failed)}. InventSmith will retry eligible work automatically; use the recovery control if it remains failed.` : "No failed work is currently recorded.",
    blocked.length ? `Human attention is currently needed for: ${format(blocked)}.` : "No human decision gate is currently waiting on you.",
  ].join("\n\n");
}
