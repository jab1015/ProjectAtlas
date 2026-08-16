"use client";

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";

type RouteState = {
  inventionId: string;
  title: string;
  currentStageId: number;
  status: "active" | "archived";
  organizationId: string | null;
  access: "manage" | "edit" | "view" | "review";
};
const getInventionRouteState = makeFunctionReference<"query", { inventionId: string }, RouteState>("organizationNavigation:getInventionRouteState");

/**
 * Keep the retired Stage 1–4 root workspace compatible while routing Stage 5+
 * inventions into the complete Journey Center. Access is resolved through the
 * organization/invention permission boundary rather than legacy ownership.
 */
export default function InventionRouteGuardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const inventionId = params.id;
  const { isAuthenticated } = useConvexAuth();
  const state = useQuery(getInventionRouteState, isAuthenticated && inventionId ? { inventionId } : "skip");

  const rootPath = `/invention/${inventionId}`;
  const shouldLeaveLegacyRoot = pathname === rootPath && Boolean(state && state.currentStageId >= 5);

  useEffect(() => {
    if (shouldLeaveLegacyRoot) router.replace(`${rootPath}/journey`);
  }, [rootPath, router, shouldLeaveLegacyRoot]);

  if (shouldLeaveLegacyRoot) {
    return <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted-foreground">Opening the complete InventSmith journey…</div>;
  }

  return children;
}
