"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Id } from "@convex/_generated/dataModel";
import { AlertTriangle, ArrowLeft, CheckCircle2, CircleDashed, FileUp, Gavel, LockKeyhole, RefreshCw, Sparkles, Wrench } from "lucide-react";
import { AppNav } from "@/components/atlas/app-nav";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { Button } from "@/components/ui/button";

interface JourneyStageRow {
  id: number;
  name: string;
  href: string;
  status: "complete" | "professional_review" | "blocked" | "working" | "ready_to_start" | "planned" | "needs_refresh" | "failed";
  requiredWorkCount: number;
  initializedWorkCount: number;
  completedWorkCount: number;
  blockedCount: number;
  failedCount: number;
  pendingProfessionalReviews: number;
  deliverableCount: number;
}

interface JourneyCenterState {
  invention: { _id: Id<"inventions">; title: string; updatedAt: number };
  stages: JourneyStageRow[];
  currentStage: JourneyStageRow;
  completedStages: number;
  totalStages: number;
  nextAction: string;
  attention: { pendingApprovals: number; openDecisions: number; blockedWork: number; pendingProfessionalReviews: number };
  evidence: { total: number; inventorProvided: number; verified: number };
}

const getJourneyCenter = makeFunctionReference<"query", { inventionId: Id<"inventions"> }, JourneyCenterState>("journeyCenter:getJourneyCenter");

const STATUS: Record<JourneyStageRow["status"], { label: string; className: string }> = {
  complete: { label: "Complete", className: "bg-success/10 text-success" },
  professional_review: { label: "Professional review", className: "bg-warning/10 text-warning" },
  blocked: { label: "Needs action", className: "bg-warning/10 text-warning" },
  working: { label: "In progress", className: "bg-primary/10 text-primary" },
  ready_to_start: { label: "Ready to start", className: "bg-primary/10 text-primary" },
  planned: { label: "Planned", className: "bg-muted text-muted-foreground" },
  needs_refresh: { label: "Refresh needed", className: "bg-warning/10 text-warning" },
  failed: { label: "Retry needed", className: "bg-destructive/10 text-destructive" },
};

function stageIcon(status: JourneyStageRow["status"]) {
  if (status === "complete") return CheckCircle2;
  if (status === "professional_review") return Gavel;
  if (status === "blocked") return LockKeyhole;
  if (status === "needs_refresh") return RefreshCw;
  if (status === "failed") return AlertTriangle;
  if (status === "working") return Wrench;
  if (status === "ready_to_start") return Sparkles;
  return CircleDashed;
}

export default function JourneyCenterPage() {
  const params = useParams();
  const router = useRouter();
  const inventionId = params.id as Id<"inventions">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const journey = useQuery(getJourneyCenter, isAuthenticated && inventionId ? { inventionId } : "skip");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || journey === undefined) {
    return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-5xl px-4 py-12 text-sm text-muted-foreground sm:px-6">Loading InventSmith journey…</main></div>;
  }
  if (!journey) return null;

  const completion = Math.round((journey.completedStages / journey.totalStages) * 100);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
          <Link href={`/invention/${inventionId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to invention</Link>

          <header className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">InventSmith Journey Center</p>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div><h1 className="text-3xl font-bold sm:text-4xl">{journey.invention.title}: idea to market</h1><p className="mt-2 max-w-3xl text-muted-foreground">You do not need to know the invention process. InventSmith tracks the evidence, work, design, professional gates, physical steps, documents, and dependencies and tells you what matters next.</p></div>
              <Button asChild size="lg"><Link href={journey.currentStage.href}>{journey.currentStage.status === "complete" ? "Open journey" : `Continue ${journey.currentStage.name}`}</Link></Button>
            </div>
          </header>

          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">What happens next</p>
            <h2 className="mt-2 text-xl font-semibold">{journey.nextAction}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Current focus: Stage {journey.currentStage.id} — {journey.currentStage.name}.</p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Journey</p><p className="mt-2 text-2xl font-semibold">{journey.completedStages}/{journey.totalStages}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} /></div></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Inventor evidence</p><p className="mt-2 text-2xl font-semibold">{journey.evidence.inventorProvided}</p><p className="mt-1 text-xs text-muted-foreground">{journey.evidence.verified} verified / {journey.evidence.total} total</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Needs your attention</p><p className="mt-2 text-2xl font-semibold">{journey.attention.pendingApprovals + journey.attention.openDecisions + journey.attention.blockedWork}</p><p className="mt-1 text-xs text-muted-foreground">approvals, decisions, blocked work</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Professional review</p><p className="mt-2 text-2xl font-semibold">{journey.attention.pendingProfessionalReviews}</p><p className="mt-1 text-xs text-muted-foreground">open review requirements</p></div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 text-xl font-semibold"><FileUp className="h-5 w-5 text-primary" />New evidence can change the journey</h2><p className="mt-1 text-sm text-muted-foreground">Upload survey data, interviews, prototype results, factory quotes, legal/professional reports, sales data, or any other invention evidence. InventSmith marks affected work for refresh automatically.</p></div><Button asChild variant="outline"><Link href={`/invention/${inventionId}/evidence`}>Evidence Locker</Link></Button></div>
          </section>

          <section className="space-y-4">
            <div><h2 className="text-xl font-semibold">Complete inventor journey</h2><p className="mt-1 text-sm text-muted-foreground">Stages remain visible from the first day. You can inspect future departments, but their work will not be treated as ready until the required upstream evidence and gates exist.</p></div>
            <div className="space-y-3">
              {journey.stages.map((stage) => {
                const Icon = stageIcon(stage.status);
                const status = STATUS[stage.status];
                return (
                  <Link key={stage.id} href={stage.href} className="block rounded-2xl border border-border bg-card p-5 no-underline transition-colors hover:border-primary/30 hover:bg-muted/20">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stage.status === "complete" ? "bg-success/10 text-success" : stage.id === journey.currentStage.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}><Icon className="h-5 w-5" /></div>
                      <div className="min-w-0 flex-1"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stage {stage.id}</p><h3 className="mt-1 font-semibold text-foreground">{stage.name}</h3></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>{status.label}</span></div><div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground"><span>{stage.completedWorkCount}/{stage.requiredWorkCount} required work complete</span><span>{stage.deliverableCount} deliverables</span>{stage.blockedCount > 0 && <span>{stage.blockedCount} blocked</span>}{stage.pendingProfessionalReviews > 0 && <span>{stage.pendingProfessionalReviews} professional reviews</span>}</div></div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>
      <footer className="border-t border-border"><MadeThisBadge /></footer>
    </div>
  );
}
