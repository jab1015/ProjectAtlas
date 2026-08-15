"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { ArrowRight } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { StatusBriefing as StatusBriefingData } from "@convex/statusBriefingLogic";
import { AppNav } from "@/components/atlas/app-nav";
import { InventionCardMenu } from "@/components/atlas/invention-card-menu";
import { JourneyMap } from "@/components/atlas/journey-map";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { ReadinessBadge } from "@/components/atlas/readiness-badge";
import { StatusBriefing } from "@/components/atlas/status-briefing";
import { Button } from "@/components/ui/button";

const getStatusBriefing = makeFunctionReference<
  "query",
  { inventionId: string },
  StatusBriefingData
>("inventionWorkspace:getStatusBriefing");

const backfillWorkspace = makeFunctionReference<
  "mutation",
  { inventionId: string },
  { recordCreated: boolean; addedWorkCount: number; alreadyCurrent: boolean }
>("inventionMigrations:backfillWorkspace");

const kickAutonomousWork = makeFunctionReference<
  "mutation",
  { inventionId: string },
  { scheduled: boolean }
>("inventionWorkspace:kickAutonomousWork");

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-label="Loading your InventSmith briefing">
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-11 w-2/3 rounded bg-muted" />
        <div className="h-5 w-full max-w-xl rounded bg-muted" />
      </div>
      <div className="h-32 rounded-2xl bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-44 rounded-xl bg-muted" />
        <div className="h-44 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  const activeInvention = useQuery(
    api.journeyEngine.getActiveInvention,
    isAuthenticated ? {} : "skip"
  );

  useEffect(() => {
    if (activeInvention === null) router.push("/onboarding");
  }, [activeInvention, router]);

  const inventionState = useQuery(
    api.journeyEngine.getInventionState,
    activeInvention ? { inventionId: activeInvention._id } : "skip"
  );

  const migrateWorkspace = useMutation(backfillWorkspace);
  const kickWork = useMutation(kickAutonomousWork);
  useEffect(() => {
    if (activeInvention) {
      void (async () => {
        try {
          await migrateWorkspace({ inventionId: activeInvention._id });
          await kickWork({ inventionId: activeInvention._id });
        } catch {
          // The briefing remains usable if migration or background work cannot start yet.
        }
      })();
    }
  }, [activeInvention, migrateWorkspace, kickWork]);

  const briefing = useQuery(
    getStatusBriefing,
    activeInvention ? { inventionId: activeInvention._id } : "skip"
  );

  if (
    isLoading ||
    !isAuthenticated ||
    activeInvention === undefined ||
    inventionState === undefined ||
    briefing === undefined
  ) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  if (!inventionState) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <main className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">InventSmith could not load this invention.</p>
            <Button asChild><Link href="/inventions">My Inventions</Link></Button>
          </div>
        </main>
      </div>
    );
  }

  const { invention, currentStage, readinessState, nextAction } = inventionState;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
          <header className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Active invention</p>
              <div className="flex items-center gap-2">
                <ReadinessBadge state={readinessState} />
                <InventionCardMenu
                  inventionId={invention._id}
                  inventionTitle={invention.title}
                  onDeleted={() => router.push("/onboarding")}
                />
              </div>
            </div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-foreground sm:text-5xl">{invention.title}</h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              InventSmith is organizing the Workshop around your invention. Review what changed, provide input only when needed, and let InventSmith keep the work moving.
            </p>
          </header>

          <StatusBriefing briefing={briefing} inventionId={invention._id} />

          <section className="rounded-xl border border-border bg-card p-5" aria-labelledby="journey-heading">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="journey-heading" className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Stage {currentStage.id} — {currentStage.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{nextAction}</p>
              </div>
              <Button asChild variant="outline" className="shrink-0 gap-2">
                <Link href={`/invention/${invention._id}`}>
                  Open invention workspace
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="mt-5 border-t border-border pt-5">
              <JourneyMap currentStageId={currentStage.id} />
            </div>
          </section>
        </div>
      </main>
      <footer className="border-t border-border"><MadeThisBadge /></footer>
    </div>
  );
}
