"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { ArrowRight, FileUp, Map, Wrench } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { StatusBriefing as StatusBriefingData } from "@convex/statusBriefingLogic";
import { AppNav } from "@/components/atlas/app-nav";
import { InventionCardMenu } from "@/components/atlas/invention-card-menu";
import { JourneyMap } from "@/components/atlas/journey-map";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { StatusBriefing } from "@/components/atlas/status-briefing";
import { Button } from "@/components/ui/button";

const getStatusBriefing = makeFunctionReference<"query", { inventionId: string }, StatusBriefingData>("inventionWorkspace:getStatusBriefing");
const backfillWorkspace = makeFunctionReference<"mutation", { inventionId: string }, { recordCreated: boolean; addedWorkCount: number; alreadyCurrent: boolean }>("inventionMigrations:backfillWorkspace");
const kickAutonomousWork = makeFunctionReference<"mutation", { inventionId: string }, { scheduled: boolean }>("inventionWorkspace:kickAutonomousWork");

interface JourneyCenterState {
  invention: { _id: Id<"inventions">; title: string; updatedAt: number };
  currentStage: { id: number; name: string; href: string; status: string };
  completedStages: number;
  totalStages: number;
  nextAction: string;
  attention: { pendingApprovals: number; openDecisions: number; blockedWork: number; pendingProfessionalReviews: number };
  evidence: { total: number; inventorProvided: number; verified: number };
}
const getJourneyCenter = makeFunctionReference<"query", { inventionId: Id<"inventions"> }, JourneyCenterState>("journeyCenter:getJourneyCenter");

function DashboardSkeleton() {
  return <div className="animate-pulse space-y-8" aria-label="Loading your InventSmith briefing"><div className="space-y-3"><div className="h-4 w-32 rounded bg-muted" /><div className="h-11 w-2/3 rounded bg-muted" /><div className="h-5 w-full max-w-xl rounded bg-muted" /></div><div className="h-32 rounded-2xl bg-muted" /><div className="grid gap-4 md:grid-cols-2"><div className="h-44 rounded-xl bg-muted" /><div className="h-44 rounded-xl bg-muted" /></div></div>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push("/sign-in"); }, [isAuthenticated, isLoading, router]);
  const activeInvention = useQuery(api.journeyEngine.getActiveInvention, isAuthenticated ? {} : "skip");
  useEffect(() => { if (activeInvention === null) router.push("/onboarding"); }, [activeInvention, router]);

  const migrateWorkspace = useMutation(backfillWorkspace);
  const kickWork = useMutation(kickAutonomousWork);
  useEffect(() => {
    if (!activeInvention) return;
    void (async () => {
      try {
        await migrateWorkspace({ inventionId: activeInvention._id });
        await kickWork({ inventionId: activeInvention._id });
      } catch {
        // Dashboard remains available when background execution is temporarily unavailable.
      }
    })();
  }, [activeInvention, migrateWorkspace, kickWork]);

  const briefing = useQuery(getStatusBriefing, activeInvention ? { inventionId: activeInvention._id } : "skip");
  const journey = useQuery(getJourneyCenter, activeInvention ? { inventionId: activeInvention._id } : "skip");

  if (isLoading || !isAuthenticated || activeInvention === undefined || briefing === undefined || journey === undefined) {
    return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6"><DashboardSkeleton /></main></div>;
  }
  if (!activeInvention || !journey) return null;

  const attentionTotal = journey.attention.pendingApprovals + journey.attention.openDecisions + journey.attention.blockedWork;
  const completionPct = Math.round((journey.completedStages / journey.totalStages) * 100);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
          <header className="space-y-5">
            <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Active invention</p><InventionCardMenu inventionId={activeInvention._id} inventionTitle={activeInvention.title} onDeleted={() => router.push("/onboarding")} /></div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-foreground sm:text-5xl">{activeInvention.title}</h1>
            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">InventSmith owns the process from idea to market. You provide the invention, evidence, decisions, physical tests, and authorizations that only you can provide; InventSmith researches, designs, prepares, coordinates, and tells you exactly what happens next.</p>
          </header>

          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Next best action</p><h2 className="mt-2 text-xl font-semibold">{journey.nextAction}</h2><p className="mt-2 text-sm text-muted-foreground">Current focus: Stage {journey.currentStage.id} — {journey.currentStage.name}</p></div><Button asChild size="lg" className="gap-2"><Link href={`/invention/${activeInvention._id}/journey`}><Map className="h-4 w-4" />Open Journey Center</Link></Button></div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Idea-to-market journey</p><p className="mt-2 text-2xl font-semibold">{journey.completedStages}/{journey.totalStages}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${completionPct}%` }} /></div></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Evidence</p><p className="mt-2 text-2xl font-semibold">{journey.evidence.inventorProvided}</p><p className="mt-1 text-xs text-muted-foreground">inventor uploads · {journey.evidence.verified} verified</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Needs you</p><p className="mt-2 text-2xl font-semibold">{attentionTotal}</p><p className="mt-1 text-xs text-muted-foreground">decisions, approvals, or blocked work</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Professional reviews</p><p className="mt-2 text-2xl font-semibold">{journey.attention.pendingProfessionalReviews}</p><p className="mt-1 text-xs text-muted-foreground">open specialist gates</p></div>
          </section>

          <StatusBriefing briefing={briefing} inventionId={activeInvention._id} />

          <section className="rounded-2xl border border-border bg-card p-6" aria-labelledby="journey-heading">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 id="journey-heading" className="text-lg font-semibold">Complete InventSmith journey</h2><p className="mt-1 text-sm text-muted-foreground">Research, patent readiness, design/CAD, prototype, factories, legal, commercialization, funding, launch and growth stay connected to one invention record.</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="outline" size="sm" className="gap-2"><Link href={`/invention/${activeInvention._id}/evidence`}><FileUp className="h-4 w-4" />Evidence</Link></Button><Button asChild variant="outline" size="sm" className="gap-2"><Link href={`/invention/${activeInvention._id}/design`}><Wrench className="h-4 w-4" />Design + CAD</Link></Button><Button asChild variant="outline" size="sm" className="gap-2"><Link href={journey.currentStage.href}>Continue<ArrowRight className="h-4 w-4" /></Link></Button></div></div>
            <div className="mt-5 border-t border-border pt-5"><JourneyMap currentStageId={journey.currentStage.id} inventionId={String(activeInvention._id)} /></div>
          </section>
        </div>
      </main>
      <footer className="border-t border-border"><MadeThisBadge /></footer>
    </div>
  );
}
