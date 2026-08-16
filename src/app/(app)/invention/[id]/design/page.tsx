"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { ArrowLeft, Box, CheckCircle2, Download, FileUp, Play, RefreshCw, ShieldAlert, Sparkles, Wrench } from "lucide-react";
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

interface NativeCadArtifact {
  _id: Id<"atlasDeliverables">;
  kind: string;
  title: string;
  version: number;
  trustState: Doc<"atlasDeliverables">["trustState"];
  artifactMaturity?: Doc<"atlasDeliverables">["artifactMaturity"];
  staleReason?: string;
  mediaType?: string;
  downloadUrl: string | null;
  updatedAt: number;
}

const getProductDesignWorkspace = makeFunctionReference<"query", { inventionId: Id<"inventions"> }, DesignWorkspace>("productDesign:getProductDesignWorkspace");
const ensureProductDesignWorkspace = makeFunctionReference<"mutation", { inventionId: Id<"inventions"> }, { created: number; total: number }>("productDesign:ensureProductDesignWorkspace");
const kickAutonomousWork = makeFunctionReference<"mutation", { inventionId: Id<"inventions"> }, { scheduled: boolean; reason: string }>("inventionWorkspace:kickAutonomousWork");
const requestNativeCadGeneration = makeFunctionReference<"mutation", { inventionId: Id<"inventions"> }, { scheduled: boolean; reason: string; workItemId: Id<"atlasWorkItems"> }>("nativeCad:requestNativeCadGeneration");
const getNativeCadArtifacts = makeFunctionReference<"query", { inventionId: Id<"inventions"> }, NativeCadArtifact[]>("nativeCad:getNativeCadArtifacts");

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

function artifactLabel(kind: string) {
  if (kind === "native_cad_step") return "STEP model";
  if (kind === "native_cad_stl") return "STL mesh";
  if (kind === "native_cad_dxf") return "DXF drawing";
  if (kind === "native_cad_source") return "Editable CAD source";
  if (kind === "cad_orthographic_views") return "Orthographic views";
  if (kind === "cad_exploded_view") return "Exploded assembly view";
  return kind.replaceAll("_", " ");
}

export default function ProductDesignStudioPage() {
  const params = useParams();
  const router = useRouter();
  const inventionId = params.id as Id<"inventions">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const workspace = useQuery(getProductDesignWorkspace, isAuthenticated && inventionId ? { inventionId } : "skip");
  const cadArtifacts = useQuery(getNativeCadArtifacts, isAuthenticated && inventionId ? { inventionId } : "skip");
  const ensureWorkspace = useMutation(ensureProductDesignWorkspace);
  const kickWork = useMutation(kickAutonomousWork);
  const requestCad = useMutation(requestNativeCadGeneration);
  const [starting, setStarting] = useState(false);
  const [generatingCad, setGeneratingCad] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  const startDesign = async () => {
    setStarting(true); setMessage(null); setError(null);
    try {
      const ensured = await ensureWorkspace({ inventionId });
      const scheduled = await kickWork({ inventionId });
      setMessage(ensured.created > 0
        ? `Product Design opened with ${ensured.created} new work items. ${scheduled.scheduled ? "InventSmith started the next eligible work." : "The queue is ready and will continue when dependencies/usage allow."}`
        : scheduled.scheduled
        ? "Product Design is already initialized. InventSmith started the next eligible work."
        : "Product Design is initialized. InventSmith is waiting for a dependency, entitlement, evidence, or daily usage capacity.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "InventSmith could not start Product Design.");
    } finally { setStarting(false); }
  };

  const generateCad = async () => {
    setGeneratingCad(true); setMessage(null); setError(null);
    try {
      const result = await requestCad({ inventionId });
      setMessage(result.scheduled
        ? "Native CAD generation started. InventSmith is creating the constrained assembly model and deterministic STEP/STL/DXF, orthographic, exploded-view, and editable-source artifacts."
        : result.reason === "already_running"
        ? "Native CAD generation is already running."
        : "Native CAD generation is queued.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "InventSmith could not start native CAD generation.");
    } finally { setGeneratingCad(false); }
  };

  if (isLoading || !isAuthenticated || workspace === undefined || cadArtifacts === undefined) {
    return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-5xl px-4 py-12 text-sm text-muted-foreground sm:px-6">Loading Product Design…</main></div>;
  }
  if (!workspace) return null;

  const completed = workspace.workItems.filter((item) => item.status === "completed").length;
  const active = workspace.workItems.filter((item) => item.status === "running" || item.status === "queued").length;
  const latestDeliverables = [...workspace.deliverables].sort((a, b) => b.updatedAt - a.updatedAt);
  const currentCadArtifacts = cadArtifacts.filter((artifact) => !artifact.staleReason);
  const cadRunning = workspace.workItems.some((item) => item.kind === "native_cad_generation" && item.status === "running");
  const completeCadPackage = ["native_cad_step", "native_cad_stl", "native_cad_dxf", "native_cad_source", "cad_orthographic_views", "cad_exploded_view"].every((kind) => currentCadArtifacts.some((artifact) => artifact.kind === kind));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
          <Link href={`/invention/${inventionId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to invention</Link>

          <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Product Design + CAD</p>
              <h1 className="text-3xl font-bold sm:text-4xl">Design Studio — {workspace.invention.title}</h1>
              <p className="max-w-3xl text-muted-foreground">InventSmith turns validation, prior-art intelligence, requirements, manufacturing evidence, cost constraints, and inventor evidence into competing design directions, scores the tradeoffs, selects/refines the strongest path, and creates native CAD artifacts for supported geometry.</p>
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
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Native CAD package</p><p className="mt-2 text-2xl font-semibold">{completeCadPackage ? "Generated" : cadRunning ? "Generating" : workspace.cadStatus.specificationReady ? "Spec ready" : "Pending"}</p><p className="mt-1 text-xs text-muted-foreground">models + drawings + exploded view</p></div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="flex items-center gap-2 text-xl font-semibold"><FileUp className="h-5 w-5 text-primary" />Design evidence</h2><p className="mt-1 text-sm text-muted-foreground">Survey results, interviews, sketches, reference images, prototype tests, professional reports, and manufacturer feedback feed the design loop.</p></div>
              <Button asChild variant="outline"><Link href={`/invention/${inventionId}/evidence`}>Open Evidence Locker</Link></Button>
            </div>
          </section>

          <section className="space-y-4">
            <div><h2 className="text-xl font-semibold">Design pipeline</h2><p className="mt-1 text-sm text-muted-foreground">Dependencies are enforced by the backend. InventSmith advances the design when required upstream work is trustworthy enough to proceed.</p></div>
            <div className="grid gap-3">
              {workspace.workItems.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Start Product Design to create the design queue.</div> : workspace.workItems.map((item) => (
                <article key={item._id} className="rounded-xl border border-border bg-card p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.kind.replaceAll("_", " ")}</p><h3 className="mt-1 font-semibold">{item.title}</h3>{item.outputSummary && <p className="mt-2 text-sm text-muted-foreground">{item.outputSummary}</p>}{item.blockedReason && <p className="mt-2 flex items-start gap-2 text-sm text-warning"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{item.blockedReason}</p>}</div><span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusClass(item.status)}`}>{STATUS_LABELS[item.status] ?? item.status}</span></div></article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="flex items-center gap-2 text-xl font-semibold"><Wrench className="h-5 w-5 text-primary" />Native CAD package</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">After the Product Design Specification is current, InventSmith converts the selected design into a constrained parametric assembly and deterministically exports STEP, STL and DXF files, editable InventSmith geometry source, orthographic engineering views, and an exploded assembly view.</p></div>
              <Button onClick={() => void generateCad()} disabled={generatingCad || cadRunning} className="gap-2"><Box className="h-4 w-4" />{generatingCad || cadRunning ? "Generating CAD…" : currentCadArtifacts.length ? "Regenerate CAD" : "Generate native CAD"}</Button>
            </div>
            {currentCadArtifacts.length > 0 && <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{currentCadArtifacts.map((artifact) => (
              <div key={artifact._id} className="rounded-xl border border-border bg-background p-4"><p className="text-xs font-semibold uppercase tracking-wider text-primary">{artifactLabel(artifact.kind)}</p><p className="mt-1 text-sm font-medium">v{artifact.version} · Preliminary CAD</p>{artifact.downloadUrl && <Button asChild variant="outline" size="sm" className="mt-3 w-full gap-2"><a href={artifact.downloadUrl} download target="_blank" rel="noreferrer"><Download className="h-4 w-4" />Download</a></Button>}</div>
            ))}</div>}
            <p className="mt-4 text-xs text-muted-foreground">Native files are real CAD geometry, but remain <strong>Preliminary CAD</strong>. Relevant engineering review, tolerance/dimension confirmation, manufacturability review, and prototype testing are required before InventSmith may promote them to Manufacturing Released.</p>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">Design deliverables</h2><p className="mt-1 text-sm text-muted-foreground">Candidate concepts, scorecards, Product Design Specification, CAD authoring specification, exploded-view plan, drawing requirements, BOM/cost work, concept renders, and native CAD collect here.</p></div><Button asChild variant="ghost" size="sm"><Link href={`/invention/${inventionId}/work`}>Open full work library</Link></Button></div>
            {latestDeliverables.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-8 text-center"><Box className="mx-auto h-8 w-8 text-primary" /><p className="mt-3 text-sm text-muted-foreground">No design deliverables have completed yet.</p></div> : <div className="space-y-4">{latestDeliverables.map((deliverable) => (
              <article key={deliverable._id} className="overflow-hidden rounded-2xl border border-border bg-card"><div className="p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{deliverable.kind.replaceAll("_", " ")} · v{deliverable.version}</p><h3 className="mt-1 text-lg font-semibold">{deliverable.title}</h3></div>{deliverable.staleReason ? <span className="rounded-full bg-warning/10 px-3 py-1 text-xs text-warning">Refresh needed</span> : <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs text-success"><CheckCircle2 className="h-3 w-3" />Current</span>}</div>{deliverable.staleReason && <p className="mt-3 text-sm text-warning">{deliverable.staleReason}</p>}{deliverable.mediaUrl && deliverable.mediaType?.startsWith("image/") && <div className="mt-5 overflow-hidden rounded-xl border border-border bg-muted/30">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={deliverable.mediaUrl} alt={deliverable.title} className="h-auto w-full" /></div>}{typeof deliverable.content === "string" && deliverable.content.trim() && <MarkdownContent content={deliverable.content} className="mt-5 text-sm" />}</div></article>
            ))}</div>}
          </section>
        </div>
      </main>
      <footer className="border-t border-border"><MadeThisBadge /></footer>
    </div>
  );
}
