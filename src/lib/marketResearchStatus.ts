export interface MarketResearchCounts {
  total: number;
  completed: number;
  queued: number;
  running: number;
  failed: number;
  blocked: number;
}

export function getMarketResearchNoDeliverableMessage(counts: MarketResearchCounts) {
  const unfinished = Math.max(0, counts.total - counts.completed);
  if (unfinished > 0) {
    const remainingWork = [
      counts.running > 0 ? `${counts.running} running` : "",
      counts.queued > 0 ? `${counts.queued} queued` : "",
      counts.blocked > 0 ? `${counts.blocked} blocked` : "",
      counts.failed > 0 ? `${counts.failed} failed and needing recovery` : "",
    ].filter(Boolean).join(", ");

    return {
      title: "Some market research is complete; more work remains.",
      detail: `${counts.completed} of ${counts.total} market work items are complete. ${remainingWork || `${unfinished} work items are unfinished`}. No combined market deliverable is saved yet.`,
    };
  }

  return {
    title: "All market research work items are complete, but no market deliverable is saved yet.",
    detail: "The work ledger has finished, but its findings are not available in the deliverables list. Refresh this page later or contact support if the report still does not appear.",
  };
}
