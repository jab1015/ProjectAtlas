"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { Button } from "@/components/ui/button";

type RouteState = {
  inventionId: string;
  title: string;
  currentStageId: number;
  status: "active" | "archived";
  organizationId: string | null;
  access: "manage" | "edit" | "view" | "review";
};

type ValidationRecoveryState = {
  state: "waiting" | "running" | "partial" | "failed" | "complete";
  successfulSectionCount: number;
  failedSectionCount: number;
  pendingSectionCount: number;
  canRetryFailed: boolean;
};

type RetryResult = {
  queued: boolean;
  failedSectionCount: number;
};

const getInventionRouteState = makeFunctionReference<
  "query",
  { inventionId: string },
  RouteState
>("organizationNavigation:getInventionRouteState");
const getValidationRecoveryState = makeFunctionReference<
  "query",
  { inventionId: string },
  ValidationRecoveryState
>("validationResearchRecovery:getValidationRecoveryState");
const retryFailedValidationSections = makeFunctionReference<
  "mutation",
  { inventionId: string },
  RetryResult
>("validationResearchSessionMutations:retryFailedValidationSections");

/**
 * Keep the retired Stage 1–4 root workspace compatible while routing Stage 5+
 * inventions into the complete Journey Center. Access is resolved through the
 * organization/invention permission boundary rather than legacy ownership.
 *
 * Stage 2 also surfaces the failed-only retry path at the route boundary. The
 * recovery query contains counts/state only and uses the organization-aware
 * read boundary; the retry mutation separately enforces edit access.
 */
export default function InventionRouteGuardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const inventionId = params.id;
  const { isAuthenticated } = useConvexAuth();
  const [retryingFailed, setRetryingFailed] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const state = useQuery(
    getInventionRouteState,
    isAuthenticated && inventionId ? { inventionId } : "skip"
  );
  const retryFailed = useMutation(retryFailedValidationSections);

  const rootPath = `/invention/${inventionId}`;
  const isValidationRoot =
    pathname === rootPath && Boolean(state && state.currentStageId === 2);
  const recovery = useQuery(
    getValidationRecoveryState,
    isAuthenticated && inventionId && isValidationRoot ? { inventionId } : "skip"
  );
  const shouldLeaveLegacyRoot =
    pathname === rootPath && Boolean(state && state.currentStageId >= 5);
  const showRecovery =
    isValidationRoot &&
    Boolean(recovery?.canRetryFailed && recovery.failedSectionCount > 0);
  const canEdit = state?.access === "manage" || state?.access === "edit";

  useEffect(() => {
    if (shouldLeaveLegacyRoot) router.replace(`${rootPath}/journey`);
  }, [rootPath, router, shouldLeaveLegacyRoot]);

  if (shouldLeaveLegacyRoot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted-foreground">
        Opening the complete InventSmith journey…
      </div>
    );
  }

  const handleRetryFailed = async () => {
    setRetryError(null);
    setRetryingFailed(true);
    try {
      const result = await retryFailed({ inventionId });
      if (!result.queued) {
        setRetryError("There are no failed validation sections left to retry.");
      }
    } catch (error) {
      setRetryError(error instanceof Error ? error.message : "Unable to retry failed validation sections.");
    } finally {
      setRetryingFailed(false);
    }
  };

  return (
    <>
      {showRecovery && recovery && (
        <div className="border-b border-amber-300/70 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                {recovery.state === "partial" ? "Validation partially complete" : "Validation needs a retry"}
              </p>
              <p className="text-xs opacity-90">
                {recovery.successfulSectionCount} sections completed successfully; {recovery.failedSectionCount} failed. Successful research is preserved.
              </p>
              {!canEdit && (
                <p className="mt-1 text-xs opacity-90">An editor or manager can retry the failed sections.</p>
              )}
              {retryError && <p className="mt-1 text-xs font-medium">{retryError}</p>}
            </div>
            {canEdit && (
              <Button
                type="button"
                size="sm"
                onClick={handleRetryFailed}
                disabled={retryingFailed}
                className="shrink-0"
              >
                {retryingFailed
                  ? "Retrying failed sections…"
                  : `Retry ${recovery.failedSectionCount} failed section${recovery.failedSectionCount === 1 ? "" : "s"}`}
              </Button>
            )}
          </div>
        </div>
      )}
      {children}
    </>
  );
}
