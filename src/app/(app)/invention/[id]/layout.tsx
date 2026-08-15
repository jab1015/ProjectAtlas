"use client";

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

/**
 * The original invention workspace still owns the specialized Stage 1–4
 * intake/validation experience. The complete InventSmith product no longer
 * stops there, however. Once an invention reaches Product Design (Stage 5) or
 * later, the legacy root route must never strand the inventor on the retired
 * "coming soon" screen; route them into the engine-owned Journey Center.
 */
export default function InventionRouteGuardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const inventionId = params.id as Id<"inventions">;
  const { isAuthenticated } = useConvexAuth();
  const state = useQuery(
    api.journeyEngine.getInventionState,
    isAuthenticated && inventionId ? { inventionId } : "skip"
  );

  const rootPath = `/invention/${inventionId}`;
  const shouldLeaveLegacyRoot = pathname === rootPath && Boolean(state && state.currentStage.id >= 5);

  useEffect(() => {
    if (shouldLeaveLegacyRoot) {
      router.replace(`${rootPath}/journey`);
    }
  }, [rootPath, router, shouldLeaveLegacyRoot]);

  if (shouldLeaveLegacyRoot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted-foreground">
        Opening the complete InventSmith journey…
      </div>
    );
  }

  return children;
}
