"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
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
  status: "complete" | "professional_review" | "blocked" | "working" | "queued" | "ready_to_start" | "planned" | "needs_refresh" | "failed";
  requiredWorkCount: number;
  initializedWorkCount: number;
  completedWorkCount: number;
  blockedCount: number;
  failedCount: number;
  pendingProfessionalReviews: number;
  deliverableCount: number;
  progressPercent: number;
  activeWorkCount: number;
  queuedWorkCount: number;
  activityLabel: string | null;
  statusExplanation: string;
}

interface JourneyCenterState {
  invention: { _id: Id<"inventions">; title: string; updatedAt: number };
  stages: JourneyStageRow[];
  currentStage: JourneyStageRow;
  completedStages: number;
  totalStages: number;
  nextAction: string;
  attention: { pendingApprovals: number; openDecisions: number; blockedWork: number; pendingProfessionalReviews: number };
  evidence: { total: number; inventorProvided: number; verified: number; customerValidationResponses: number };
}

interface StatusBriefing {
  needsInventor: Array<{
    type: "decision" | "approval" | "blocked_work";
    title: string;
    detail: string;
    requestedAt: number;
  }>;
}

const getJourneyCenter = makeFunctionReference<"query", { inventionId: Id<"inventions"> }, JourneyCenterState>("journeyCenter:getJourneyCenter");
const backfillWorkspace = makeFunctionReference<"mutation", { inventionId: Id<"inventions"> }, { addedWorkCount: number }>("inventionMigrations:backfillWorkspace");
const kickAutonomousWork = makeFunctionReference<"mutation", { inventionId: Id<"inventions"> }, { scheduled: boolean; reason: string }>("inventionWorkspace:kickAutonomousWork");
const getStatusBriefing = makeFunctionReference<"query", { inventionId: Id<"inventions"> }, StatusBriefing>("inventionWorkspace:getStatusBriefing");

const STATUS: Record<JourneyStageRow["status"], { label: string; className: string }> = {
  complete: { label: "Done", className: "bg-success/10 text-success" },
  professional_review: { label: "Needs expert review", className: "bg-warning/10 text-warning" },
  blocked: { label: "Waiting for you", className: "bg-warning/10 text-warning" },
  working: { label: "In progress", className: "bg-primary/10 text-primary" },
  queued: { label: "Queued", className: "bg-muted text-muted-foreground" },
  ready_to_start: { label: "Ready to start", className: "bg-primary/10 text-primary" },
  planned: { label: "Up next", className: "bg-muted text-muted-foreground" },
  needs_refresh: { label: "Needs an update", className: "bg-warning/10 text-warning" },
  failed: { label: "Needs a retry", className: "bg-destructive/10 text-destructive" },
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

function stageStatusLabel(stage: JourneyStageRow) {
  if (stage.status === "needs_refresh") {
    if (stage.activeWorkCount > 0) return "Updating";
    if (stage.queuedWorkCount > 0) return "Refresh queued";
    return "Review update";
  }
  return STATUS[stage.status].label;
}

export default function JourneyCenterPage() {
  const params = useParams();
  const router = useRouter();
  const inventionId = params.id as Id<"inventions">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const journey = useQuery(getJourneyCenter, isAuthenticated && inventionId ? { inventionId } : "skip");
  const briefing = useQuery(getStatusBriefing, isAuthenticated && inventionId ? { inventionId } : "skip");
  const migrateWorkspace = useMutation(backfillWorkspace);
  const kickWork = useMutation(kickAutonomousWork);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !inventionId) return;
    void (async () => {
      try {
        await migrateWorkspace({ inventionId });
        await kickWork({ inventionId });
      } catch {
        // Journey rendering is independent of the scheduler; a later visit
        // retries the idempotent wake-up.
      }
    })();
  }, [inventionId, isAuthenticated, isLoading, migrateWorkspace, kickWork]);

  if (isLoading || !isAuthenticated || journey === undefined) {
    return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-5xl px-4 py-12 text-sm text-muted-foreground sm:px-6">Loading InventSmith journey…</main></div>;
  }
  if (!journey) return null;

  const completion = Math.round((journey.completedStages / journey.totalStages) * 100);
  const nextAction = journey.nextAction;
  const attentionItems = briefing?.needsInventor ?? [];
  const attentionCount = journey.attention.pendingApprovals + journey.attention.openDecisions + journey.attention.blockedWork;
  const reviewHref = `/invention/${inventionId}/review`;

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
              <Button asChild size="lg"><Link href={journey.currentStage.href}>{journey.currentStage.status === "complete" ? "Open journey" : "Do the next step"}</Link></Button>
            </div>
            <p className="max-w-4xl rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">“Stage work complete” means InventSmith’s required work for that stage is complete. It does not mean InventSmith contacted a supplier or professional, placed an order or payment, submitted a filing, published anything, or launched a product.</p>
          </header>

          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">What happens next</p>
            <h2 className="mt-2 text-xl font-semibold">{nextAction}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Current focus: Stage {journey.currentStage.id} — {journey.currentStage.name}.</p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Stages done</p><p className="mt-2 text-2xl font-semibold">{journey.completedStages}/{journey.totalStages}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} /></div></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Customer validation</p><p className="mt-2 text-2xl font-semibold">{journey.evidence.customerValidationResponses}</p><p className="mt-1 text-xs text-muted-foreground">site responses counted · {journey.evidence.verified} independently verified sources</p></div>
            <details className="group rounded-2xl border border-warning/40 bg-warning/5 p-5 [&_summary::-webkit-details-marker]:hidden"><summary className="cursor-pointer list-none"><div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-warning">Needs your attention</p><p className="mt-2 text-2xl font-semibold">{attentionCount}</p><p className="mt-1 text-xs text-muted-foreground">Tap to see exactly what to do</p></div><span className="mt-1 text-xl text-warning transition-transform group-open:rotate-180">⌄</span></div></summary><div className="mt-5 border-t border-warning/20 pt-4"><p className="text-sm font-medium">InventSmith is waiting for these specific actions:</p>{attentionItems.length > 0 ? <div className="mt-3 space-y-3">{attentionItems.map((item) => <div key={`${item.type}-${item.title}-${item.requestedAt}`} className="rounded-xl border border-border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.type === "decision" ? "Your decision" : item.type === "approval" ? "Your authorization" : "Information needed"}</p><p className="mt-1 font-medium">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.detail}</p><Link href={reviewHref} className="mt-3 inline-flex text-sm font-medium text-primary underline underline-offset-4">Open and respond</Link></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">The attention details are still loading. Open the review queue to see the current items.</p>}<Link href={reviewHref} className="mt-4 inline-flex text-sm font-semibold text-primary">Open full review queue →</Link></div></details>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Professional review gates</p><p className="mt-2 text-2xl font-semibold">{journey.attention.pendingProfessionalReviews}</p><p className="mt-1 text-xs text-muted-foreground">Qualified reviewers must complete these gates. They are not decisions for you to submit.</p></div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 text-xl font-semibold"><FileUp className="h-5 w-5 text-primary" />New evidence can change the journey</h2><p className="mt-1 text-sm text-muted-foreground">Upload survey data, interviews, prototype results, factory quotes, legal/professional reports, sales data, or any other invention evidence. InventSmith marks affected work for refresh automatically.</p></div><Button asChild variant="outline"><Link href={`/invention/${inventionId}/evidence`}>Evidence Locker</Link></Button></div>
          </section>

          <section className="space-y-4">
            <div><h2 className="text-xl font-semibold">Inventor journey</h2><p className="mt-1 text-sm text-muted-foreground">Stages remain visible from the first day. You can inspect future departments, but their work will not be treated as ready until the required upstream evidence and gates exist. Stage-work completion does not by itself represent an external real-world action.</p></div>
            <div className="space-y-3">
              {journey.stages.map((stage) => {
                const Icon = stageIcon(stage.status);
                const status = STATUS[stage.status];
                return (
                  <Link key={stage.id} href={stage.status === "blocked" || stage.status === "professional_review" ? reviewHref : stage.href} className="block rounded-2xl border border-border bg-card p-5 no-underline transition-colors hover:border-primary/30 hover:bg-muted/20">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stage.status === "complete" ? "bg-success/10 text-success" : stage.id === journey.currentStage.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}><Icon className="h-5 w-5" /></div>
                      <div className="min-w-0 flex-1"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stage {stage.id}</p><h3 className="mt-1 font-semibold text-foreground">{stage.name}</h3></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>{stageStatusLabel(stage)}</span></div><p className="mt-2 text-sm text-muted-foreground">{stage.statusExplanation}</p><div className="mt-4"><div className="flex items-center justify-between text-xs"><span className="font-medium text-foreground">Work progress</span><span className="text-muted-foreground">{stage.progressPercent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full transition-all ${stage.activeWorkCount > 0 ? "animate-pulse bg-primary" : stage.status === "complete" ? "bg-success" : "bg-primary/60"}`} style={{ width: `${Math.max(stage.progressPercent, stage.status === "working" ? 1 : 0)}%` }} /></div>{stage.activityLabel && <p className="mt-2 text-xs text-muted-foreground"><span className="font-medium text-foreground">{stage.activeWorkCount > 0 ? "Working now:" : stage.queuedWorkCount > 0 ? "Queued work:" : "Latest activity:"}</span> {stage.activityLabel}</p>}</div><div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground"><span>{stage.completedWorkCount}/{stage.requiredWorkCount} tasks done</span><span>{stage.deliverableCount} saved results</span>{stage.activeWorkCount > 0 && <span>{stage.activeWorkCount} active</span>}{stage.queuedWorkCount > 0 && <span>{stage.queuedWorkCount} queued</span>}{stage.blockedCount > 0 && <span>{stage.blockedCount} waiting for you</span>}{stage.pendingProfessionalReviews > 0 && <span>{stage.pendingProfessionalReviews} expert reviews</span>}</div></div>
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
