"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { ArrowLeft, CheckCircle2, FileUp, Play, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
import { AppNav } from "@/components/atlas/app-nav";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import { contentToReadableText } from "@convex/deliverableLogic";

interface DepartmentState {
  stage: { id: number; name: string; description: string; workCount: number };
  invention: { _id: Id<"inventions">; title: string };
  initialized: boolean;
  workItems: Doc<"atlasWorkItems">[];
  deliverables: Doc<"atlasDeliverables">[];
  evidenceCount: number;
  inventorEvidenceCount: number;
}

const getLifecycleDepartment = makeFunctionReference<"query", { inventionId: Id<"inventions">; stageId: number }, DepartmentState>("lifecycleDepartments:getLifecycleDepartment");
const ensureLifecycleDepartment = makeFunctionReference<"mutation", { inventionId: Id<"inventions">; stageId: number }, { created: number; total: number; stageName: string }>("lifecycleDepartments:ensureLifecycleDepartment");
const kickAutonomousWork = makeFunctionReference<"mutation", { inventionId: Id<"inventions"> }, { scheduled: boolean; reason: string }>("inventionWorkspace:kickAutonomousWork");

const STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  running: "InventSmith working",
  blocked: "Needs inventor/professional input",
  awaiting_approval: "Awaiting approval",
  completed: "Complete",
  failed: "Retry needed",
  cancelled: "Cancelled",
  stale: "Refresh needed",
};

function statusClass(status: string) {
  if (status === "completed") return "bg-success/10 text-success";
  if (status === "running") return "bg-primary/10 text-primary";
  if (status === "blocked" || status === "awaiting_approval") return "bg-warning/10 text-warning";
  return "bg-muted text-muted-foreground";
}

export default function LifecycleDepartmentPage() {
  const params = useParams();
  const router = useRouter();
  const inventionId = params.id as Id<"inventions">;
  const stageId = Number(params.stageId);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const validStage = Number.isInteger(stageId) && stageId >= 6 && stageId <= 15;
  const department = useQuery(getLifecycleDepartment, isAuthenticated && inventionId && validStage ? { inventionId, stageId } : "skip");
  const ensureDepartment = useMutation(ensureLifecycleDepartment);
  const kickWork = useMutation(kickAutonomousWork);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
    if (!validStage) router.replace(`/invention/${inventionId}`);
  }, [isAuthenticated, isLoading, router, validStage, inventionId]);

  const counts = useMemo(() => {
    if (!department) return { complete: 0, active: 0, blocked: 0 };
    return {
      complete: department.workItems.filter((item) => item.status === "completed").length,
      active: department.workItems.filter((item) => item.status === "queued" || item.status === "running").length,
      blocked: department.workItems.filter((item) => item.status === "blocked" || item.status === "awaiting_approval").length,
    };
  }, [department]);

  const startDepartment = async () => {
    setStarting(true); setMessage(null); setError(null);
    try {
      const ensured = await ensureDepartment({ inventionId, stageId });
      const scheduled = await kickWork({ inventionId });
      setMessage(ensured.created > 0
        ? `${ensured.stageName} opened with ${ensured.created} new work items. ${scheduled.scheduled ? "InventSmith started the next eligible work." : "The department is ready; dependencies or usage controls currently prevent another autonomous run."}`
        : scheduled.scheduled
        ? `${ensured.stageName} is already initialized. InventSmith started the next eligible work.`
        : `${ensured.stageName} is initialized and waiting for its next dependency, evidence, approval, professional review, physical task, or usage capacity.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "InventSmith could not initialize this department.");
    } finally { setStarting(false); }
  };

  if (isLoading || !isAuthenticated || department === undefined) {
    return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-5xl px-4 py-12 text-sm text-muted-foreground sm:px-6">Loading department…</main></div>;
  }
  if (!department) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
          <Link href={`/invention/${inventionId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to invention</Link>

          <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Stage {department.stage.id} · Idea to market</p>
              <h1 className="text-3xl font-bold sm:text-4xl">{department.stage.name} — {department.invention.title}</h1>
              <p className="max-w-3xl text-muted-foreground">{department.stage.description}</p>
            </div>
            <Button size="lg" onClick={() => void startDepartment()} disabled={starting} className="gap-2">
              {starting ? <RefreshCw className="h-4 w-4 animate-spin" /> : department.initialized ? <Play className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {starting ? "Starting…" : department.initialized ? "Continue department" : `Start ${department.stage.name}`}
            </Button>
          </header>

          {message && <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">{message}</div>}
          {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Work complete</p><p className="mt-2 text-2xl font-semibold">{counts.complete}/{department.stage.workCount}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Active</p><p className="mt-2 text-2xl font-semibold">{counts.active}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Needs action</p><p className="mt-2 text-2xl font-semibold">{counts.blocked}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Inventor evidence</p><p className="mt-2 text-2xl font-semibold">{department.inventorEvidenceCount}</p><p className="mt-1 text-xs text-muted-foreground">of {department.evidenceCount} total sources</p></div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 text-xl font-semibold"><FileUp className="h-5 w-5 text-primary" />Evidence follows the invention</h2><p className="mt-1 text-sm text-muted-foreground">Upload surveys, interviews, prototype tests, quotes, contracts, sales/launch data, or professional reports at any time. InventSmith preserves provenance and refreshes affected downstream work.</p></div><Button asChild variant="outline"><Link href={`/invention/${inventionId}/evidence`}>Evidence Locker</Link></Button></div>
          </section>

          <section className="space-y-4">
            <div><h2 className="text-xl font-semibold">Department work</h2><p className="mt-1 text-sm text-muted-foreground">InventSmith performs eligible work autonomously and stops only at genuine inventor, professional, physical, payment, or external-action gates.</p></div>
            {department.workItems.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Start the department to create its work plan.</div> : <div className="space-y-3">{department.workItems.map((item) => (
              <article key={item._id} className="rounded-xl border border-border bg-card p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.kind.replaceAll("_", " ")}</p><h3 className="mt-1 font-semibold">{item.title}</h3>{item.outputSummary && <p className="mt-2 text-sm text-muted-foreground">{item.outputSummary}</p>}{item.blockedReason && <p className="mt-2 flex items-start gap-2 text-sm text-warning"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{item.blockedReason}</p>}</div><span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusClass(item.status)}`}>{STATUS_LABELS[item.status] ?? item.status}</span></div></article>
            ))}</div>}
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">Department deliverables</h2><p className="mt-1 text-sm text-muted-foreground">Every completed artifact remains traceable to evidence, assumptions, limitations, revisions, and required professional review.</p></div><Button asChild variant="ghost" size="sm"><Link href={`/invention/${inventionId}/work`}>Full work library</Link></Button></div>
            {department.deliverables.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No department deliverables have completed yet.</div> : <div className="space-y-4">{department.deliverables.map((deliverable) => {
              const readable = contentToReadableText(deliverable.content);
              return <article key={deliverable._id} className="rounded-2xl border border-border bg-card p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{deliverable.kind.replaceAll("_", " ")} · v{deliverable.version}</p><h3 className="mt-1 text-lg font-semibold">{deliverable.title}</h3></div>{deliverable.staleReason ? <span className="rounded-full bg-warning/10 px-3 py-1 text-xs text-warning">Refresh needed</span> : <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs text-success"><CheckCircle2 className="h-3 w-3" />Current</span>}</div>{deliverable.staleReason && <p className="mt-3 text-sm text-warning">{deliverable.staleReason}</p>}{readable && <MarkdownContent content={readable} className="mt-5 text-sm" />}</article>;
            })}</div>}
          </section>
        </div>
      </main>
      <footer className="border-t border-border"><MadeThisBadge /></footer>
    </div>
  );
}
