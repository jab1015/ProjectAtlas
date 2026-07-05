"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { AppNav } from "@/components/atlas/app-nav";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { Button } from "@/components/ui/button";
import { ReadinessBadge } from "@/components/atlas/readiness-badge";
import { JourneyMap } from "@/components/atlas/journey-map";
import { ArrowRight, Lock } from "lucide-react";
import { trackContinueClicked } from "@/lib/analytics";
import Link from "next/link";
import { InventionCardMenu } from "@/components/atlas/invention-card-menu";

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-muted rounded w-1/3 mb-4" />
      <div className="h-5 bg-muted rounded w-1/4 mb-8" />
      <div className="h-32 bg-muted rounded mb-4" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Redirect unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  const activeInvention = useQuery(
    api.journeyEngine.getActiveInvention,
    isAuthenticated ? {} : "skip"
  );

  // Redirect to onboarding if no invention yet
  useEffect(() => {
    if (activeInvention === null) {
      router.push("/onboarding");
    }
  }, [activeInvention, router]);

  const inventionState = useQuery(
    api.journeyEngine.getInventionState,
    activeInvention ? { inventionId: activeInvention._id } : "skip"
  );

  if (isLoading || !isAuthenticated || activeInvention === undefined || inventionState === undefined) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppNav />
        <main className="flex-1 mx-auto max-w-3xl w-full px-4 sm:px-6 py-12">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  if (!inventionState) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Could not load your invention.</p>
            <Button asChild>
              <Link href="/inventions">My Inventions</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { invention, currentStage, readinessState, nextAction } = inventionState;

  const handleContinue = () => {
    trackContinueClicked(currentStage.id, currentStage.name, invention._id);
    router.push(`/invention/${invention._id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 space-y-12">

          {/* ── Primary card ─────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 space-y-6 group">
            {/* Stage label + context menu */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-widest text-primary">
                Stage {currentStage.id} — {currentStage.name}
              </p>
              <div className="flex items-center gap-2">
                <ReadinessBadge state={readinessState} />
                <InventionCardMenu
                  inventionId={invention._id}
                  inventionTitle={invention.title}
                  onDeleted={() => router.push("/onboarding")}
                />
              </div>
            </div>

            {/* Invention title */}
            <h1
              className="text-3xl sm:text-4xl font-bold text-foreground leading-tight"
              style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
            >
              {invention.title}
            </h1>

            {/* Atlas recommendation — mentor voice */}
            <p className="text-base text-muted-foreground italic leading-relaxed border-l-2 border-primary/30 pl-4">
              {nextAction}
            </p>

            {/* Single primary CTA */}
            <Button
              size="lg"
              onClick={handleContinue}
              className="gap-2 text-base"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* ── Journey map ──────────────────────────────────────────────── */}
          <div>
            <h2
              className="text-sm font-semibold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
            >
              Your invention journey
            </h2>
            <JourneyMap currentStageId={currentStage.id} />
          </div>

        </div>
      </main>

      <footer className="border-t border-border">
        <MadeThisBadge />
      </footer>
    </div>
  );
}
