"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { ArrowLeft, Box, CheckCircle2, FileUp, Layers3, Play, RefreshCw, ShieldAlert, Sparkles, Wrench } from "lucide-react";
import { AppNav } from "@/components/atlas/app-nav";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";

interface DesignWorkspace {
  invention: { _id: Id<"inventions">; title: string };
  initialized: boolean;
  workItems: Doc<"atlasWorkItems">[];
  deliverables: Array<Doc<"atlasDeliverables"> & { mediaUrl: string | null }>;
  evidenceCount: number;
  inventorEvidenceCount: number;
  cadStatus: { specificationReady: boolean; nativeCadFilesGenerated: boolean };
}

const getProductDesignWorkspace = makeFunctionReference<"query", { inventionId: Id<"inventions"> }, DesignWorkspace>("productDesign:getProductDesignWorkspace");
const ensureProductDesignWorkspace = makeFunctionReference<"mutation", { inventionId: Id<"inventions"> }, { created: number; total: number }>("productDesign:ensureProductDesignWorkspace");
const kickAutonomousWork = makeFunctionReference<"mutation", { inventionId: Id<"inventions"> }, { scheduled: boolean; reason: string }>("inventionWorkspace:kickAutonomousWork");

const STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  running: "InventSmith working",
  blocked: "Needs input",
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

export default function ProductDesignStudioPage() {
  const params = useParams();
  const router = useRouter();
  const inventionId = params.id as Id<"inventions">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const workspace = useQuery(getProductDesignWorkspace, isAuthenticated && inventionId ? { inventionId } : "skip");
  const ensureWorkspace = useMutation(ensureProductDesignWorkspace);
  const kickWork = useMutation(kickAutonomousWork);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  const startDesign = async () => {
    setStarting(true);
    setMessage(null);
    setError(null);
    try {
      const ensured = await ensureWorkspace({ inventionId });
      const scheduled = await kickWork({ inventionId });
      setMessage(
        ensured.created > 0
          ? `Product Design opened with ${ensured.created} new work items. ${scheduled.scheduled ? "InventSmith started the next eligible work." : "The queue is ready and will continue when dependencies/usage allow."}`
          : scheduled.scheduled
          ? "Product Design is already initialized. InventSmith started the next eligible work."
          : "Product Design is initialized. InventSmith is waiting for a dependency, entitlement, evidence, or daily usage capacity."
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "InventSmith could not start Product Design.");
    } finally {
      setStarting(false);
    }
  };

  if (isLoading || !isAuthenticated || workspace === undefined) {
    return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-5xl px-4 py-12 text-sm text-muted-foreground sm:px-6">Loading Product Design…</main></div>;
  }
  if (!workspace) return null;

  const completed = workspace.workItems.filter((item) => item.status === "completed").length;
  const active = workspace.workItems.filter((item) => item.status === "running" || item.status === "queued").length;
  const blocked = workspace.workItems.filter((item) => item.status === "blocked" || item.status === "awaiting_approval").length;
  const latestDeliverables = [...workspace.deliverables].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
          <Link href={`/invention/${inventionId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />Back to invention
          </Link>

          <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Product Design + CAD</p>
              <h1 className="text-3xl font-bold sm:text-4xl">Design Studio — {workspace.invention.title}</h1>
              <p className="max-w-3xl text-muted-foreground">
                InventSmith turns validation, prior-art intelligence, requirements, manufacturing evidence, cost constraints, and inventor evidence into competing design directions, scores the tradeoffs, and prepares the selected product for CAD and engineering.
              </p>
            </div>
            <Button onClick={() => void startDesign()} disabled={starting} size="lg" className="gap-2">
              {starting ? <RefreshCw className="h-4 w-4 animate-spin" /> : workspace.initialized ? <Play className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {starting ? "Starting…" : workspace.initialized ? "Continue design work" : "Start Product Design"}
            </Button>
          </header>

          {message && <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">{message}</div>}
          {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Design work</p><p className="mt-2 text-2xl font-semibold">{completed}/{workspace.workItems.length}</p><p className="mt-1 text-xs text-muted-foreground">completed</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Active queue</p><p className="mt-2 text-2xl font-semibold">{active}</p><p className="mt-1 text-xs text-muted-foreground">queued or running</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Inventor evidence</p><p className="mt-2 text-2xl font-semibold">{workspace.inventorEvidenceCount}</p><p className="mt-1 text-xs text-muted-foreground">of {workspace.evidenceCount} sources</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Native CAD</p><p className="mt-2 text-2xl font-semibold">{workspace.cadStatus.nativeCadFilesGenerated ? "Ready" : workspace.cadStatus.specificationReady ? "Spec ready" : "Pending"}</p><p className="mt-1 text-xs text-muted-foreground">STEP/STL/DXF pipeline</p></div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-semibold"><FileUp className="h-5 w-5 text-primary" />Design evidence</h2>
                <p className="mt-1 text-sm text-muted-foreground">Survey results, interviews, sketches, reference images, prototype tests, professional reports, and manufacturer feedback feed the design loop.</p>
              </div>
              <Button asChild variant="outline"><Link href={`/invention/${inventionId}/evidence`}>Open Evidence Locker</Link></Button>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Design pipeline</h2>
              <p className="mt-1 text-sm text-muted-foreground">Dependencies are enforced by the backend. InventSmith advances the design when required upstream work is trustworthy enough to proceed.</p>
            </div>
            <div className="grid gap-3">
              {workspace.workItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Start Product Design to create the design queue.</div>
              ) : workspace.workItems.map((item) => (
                <article key={item._id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.kind.replaceAll("_", " ")}</p>
                      <h3 className="mt-1 font-semibold">{item.title}</h3>
                      {item.outputSummary && <p className="mt-2 text-sm text-muted-foreground">{item.outputSummary}</p>}
                      {item.blockedReason && <p className="mt-2 flex items-start gap-2 text-sm text-warning"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{item.blockedReason}</p>}
                    </div>
                    <span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusClass(item.status)}`}>{STATUS_LABELS[item.status] ?? item.status}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div><h2 className="text-xl font-semibold">Design deliverables</h2><p className="mt-1 text-sm text-muted-foreground">Candidate concepts, scorecards, Product Design Specification, CAD authoring specification, exploded-view plan, drawing requirements, BOM/cost work, and concept renders collect here.</p></div>
              <Button asChild variant="ghost" size="sm"><Link href={`/invention/${inventionId}/work`}>Open full work library</Link></Button>
            </div>

            {latestDeliverables.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center"><Box className="mx-auto h-8 w-8 text-primary" /><p className="mt-3 text-sm text-muted-foreground">No design deliverables have completed yet.</p></div>
            ) : (
              <div className="space-y-4">
                {latestDeliverables.map((deliverable) => (
                  <article key={deliverable._id} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="p-6">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{deliverable.kind.replaceAll("_", " ")} · v{deliverable.version}</p><h3 className="mt-1 text-lg font-semibold">{deliverable.title}</h3></div>
                        {deliverable.staleReason ? <span className="rounded-full bg-warning/10 px-3 py-1 text-xs text-warning">Refresh needed</span> : <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs text-success"><CheckCircle2 className="h-3 w-3" />Current</span>}
                      </div>
                      {deliverable.staleReason && <p className="mt-3 text-sm text-warning">{deliverable.staleReason}</p>}
                      {deliverable.mediaUrl && <div className="mt-5 overflow-hidden rounded-xl border border-border bg-muted/30">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={deliverable.mediaUrl} alt={deliverable.title} className="h-auto w-full" /></div>}
                      {typeof deliverable.content === "string" && deliverable.content.trim() && <MarkdownContent content={deliverable.content} className="mt-5 text-sm" />}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-7">
            <div className="flex items-start gap-3"><Wrench className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><h2 className="font-semibold">CAD maturity boundary</h2><p className="mt-1 text-sm text-muted-foreground">This studio now prepares the evidence-backed design and CAD authoring specification. A separate native CAD generator is being built to create editable geometry and STEP/STL/DXF artifacts. InventSmith will not falsely label a text specification or concept render as factory-ready CAD. Manufacturing Released maturity remains gated by required engineering review for consequential products.</p></div></div>
          </section>
        </div>
      </main>
      <footer className="border-t border-border"><MadeThisBadge /></footer>
    </div>
  );
}
