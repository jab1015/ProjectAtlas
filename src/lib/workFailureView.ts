export interface FailedWorkSummary {
  workItemId?: string;
  kind: string;
  title: string;
  attemptCount: number;
  updatedAt: number;
  summary: string;
}

/** Older deployed query versions may not yet return failure summaries. */
export function getFailedWorkItems(response: { failedWork?: FailedWorkSummary[] } | null | undefined): FailedWorkSummary[] {
  return Array.isArray(response?.failedWork) ? response.failedWork : [];
}
