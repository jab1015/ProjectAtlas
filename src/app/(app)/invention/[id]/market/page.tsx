"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { ArrowLeft, Download, ExternalLink, FileUp, LineChart, MessageCircle, Search, Users } from "lucide-react";
import { AppNav } from "@/components/atlas/app-nav";
import { userFacingError } from "@/lib/userFacingError";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import { contentToReadableText, getDeliverableTrustLabel } from "@convex/deliverableLogic";
import { isInventorEvidenceSource } from "@convex/chatEvidenceLogic";
import { getMarketResearchNoDeliverableMessage } from "@/lib/marketResearchStatus";

interface DeliverableLibrary {
  invention: { _id: Id<"inventions">; title: string };
  deliverables: Array<Doc<"atlasDeliverables"> & { mediaUrl: string | null }>;
  sources: Doc<"evidenceSources">[];
  reviews: Doc<"professionalReviews">[];
  executionEvents: Doc<"atlasExecutionEvents">[];
  workItems?: Array<{
    workItemId: Id<"atlasWorkItems">;
    kind: string;
    title: string;
    status: string;
    attemptCount: number;
    updatedAt: number;
    blockedReason?: string;
    outputSummary?: string;
  }>;
  failedWork?: Array<{
    workItemId: Id<"atlasWorkItems">;
    kind: string;
    title: string;
    attemptCount: number;
    updatedAt: number;
    summary: string;
  }>;
}

const getDeliverableLibrary = makeFunctionReference<"query", { inventionId: Id<"inventions"> }, DeliverableLibrary>("inventionWorkspace:getDeliverableLibrary");
const getCompetitiveResearchExport = makeFunctionReference<"query", { inventionId: Id<"inventions"> }, { title: string; version: number; staleReason: string | null; downloadUrl: string } | null>("deliverableDownloads:getCompetitiveResearchExport");
const backfillWorkspace = makeFunctionReference<"mutation", { inventionId: Id<"inventions"> }, { addedWorkCount: number }>("inventionMigrations:backfillWorkspace");
const kickAutonomousWork = makeFunctionReference<"mutation", { inventionId: Id<"inventions"> }, { scheduled: boolean; reason: string }>("inventionWorkspace:kickAutonomousWork");
const MARKET_KINDS = new Set(["competitor_discovery", "market_feasibility"]);
const MARKET_WORK_KINDS = new Set(["competitor_discovery", "market_feasibility"]);

function isWebLocator(locator?: string): locator is string {
  return Boolean(locator && /^https?:\/\//i.test(locator));
}

function sourceEvidenceLabel(source: Doc<"evidenceSources">) {
  const metadata = source.metadata as { evidenceKind?: string; fileName?: string; evidenceOrigin?: string; capturedFrom?: string } | undefined;
  if (metadata?.capturedFrom === "ask_inventsmith") return "Inventor statement";
  if (metadata?.fileName) return metadata.fileName;
  if (metadata?.evidenceOrigin === "public_response") return "Survey/interview response";
  return metadata?.evidenceKind?.replaceAll("_", " ") ?? "Inventor evidence";
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export default function MarketResearchPage() {
  const params = useParams();
  const router = useRouter();
  const inventionId = params.id as Id<"inventions">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const library = useQuery(getDeliverableLibrary, isAuthenticated && inventionId ? { inventionId } : "skip");
  const competitiveExport = useQuery(getCompetitiveResearchExport, isAuthenticated && inventionId ? { inventionId } : "skip");
  const migrateWorkspace = useMutation(backfillWorkspace);
  const kickWork = useMutation(kickAutonomousWork);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  async function downloadCompetitiveResearch() {
    if (!competitiveExport?.downloadUrl) return;
    setExportError(null);
    try {
      // Downloading the data URL directly is unreliable in Chrome, especially
      // for large reports. Materialize it as a Blob and trigger a normal file
      // download instead.
      const response = await fetch(competitiveExport.downloadUrl);
      if (!response.ok) throw new Error(`Export request failed (${response.status})`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = competitiveExport.title;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error("Could not download competitor research:", error);
      setExportError("The Excel export could not be downloaded. Please try again.");
    }
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !inventionId) return;
    setQueueError(null);
    void (async () => {
      try {
        await migrateWorkspace({ inventionId });
        await kickWork({ inventionId });
      } catch (error) {
        console.error("Could not initialize market research work:", error);
        setQueueError(userFacingError(error, "The autonomous work queue could not be initialized yet."));
      }
    })();
  }, [inventionId, isAuthenticated, isLoading, migrateWorkspace, kickWork]);

  if (isLoading || !isAuthenticated || library === undefined) {
    return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-5xl px-4 py-12 text-sm text-muted-foreground sm:px-6">Loading Market Research…</main></div>;
  }
  if (!library) return null;

  const deliverables = library.deliverables.filter((item) => MARKET_KINDS.has(item.kind));
  const sourcesById = new Map(library.sources.map((source) => [String(source._id), source]));
  // Older Ask InventSmith questions were incorrectly saved as evidence.
  // Keep genuine factual statements, but remove conversational turns from
  // this evidence-only view without deleting the underlying chat history.
  const inventorEvidence = library.sources.filter((source) => isInventorEvidenceSource(source.metadata, source.excerpt));
  const marketWork = (library.workItems ?? []).filter((item) => MARKET_WORK_KINDS.has(item.kind));
  const completedMarketWork = marketWork.filter((item) => item.status === "completed").length;
  const marketProgress = marketWork.length > 0 ? Math.round((completedMarketWork / marketWork.length) * 100) : 0;
  const marketCounts = {
    total: marketWork.length,
    completed: completedMarketWork,
    queued: marketWork.filter((item) => item.status === "queued").length,
    running: marketWork.filter((item) => item.status === "running").length,
    failed: marketWork.filter((item) => item.status === "failed").length,
    blocked: marketWork.filter((item) => item.status === "blocked" || item.status === "awaiting_approval").length,
  };
  const noDeliverableMessage = getMarketResearchNoDeliverableMessage(marketCounts);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
          <Link href={`/invention/${inventionId}/journey`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to Journey Center</Link>
          <header className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Stage 3 — Market Research</p>
            <h1 className="text-3xl font-bold sm:text-4xl">{library.invention.title}: customers, competitors and demand evidence</h1>
            <p className="max-w-3xl text-muted-foreground">InventSmith researches the market and combines that research with inventor-provided surveys, interviews and customer evidence. Observed evidence, estimates and AI inference remain separate so Validation, Product Design, Pricing and Funding can use the record without overstating demand.</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline"><Link href={`/invention/${inventionId}/evidence`}><FileUp className="mr-2 h-4 w-4" />Upload surveys, interviews or market evidence</Link></Button>
              <Button asChild variant="outline"><Link href={`/invention/${inventionId}/chat`}><MessageCircle className="mr-2 h-4 w-4" />Ask InventSmith what is happening</Link></Button>
              {competitiveExport?.downloadUrl && <Button type="button" variant="outline" onClick={() => void downloadCompetitiveResearch()}><Download className="mr-2 h-4 w-4" />Save competitor research to Excel</Button>}
            </div>
            {exportError && <p role="alert" className="text-sm text-destructive">{exportError}</p>}
          </header>

          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5"><Search className="h-5 w-5 text-primary" /><p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Market deliverables</p><p className="mt-1 text-2xl font-semibold">{deliverables.length}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><Users className="h-5 w-5 text-primary" /><p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Inventor evidence items</p><p className="mt-1 text-2xl font-semibold">{inventorEvidence.length}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><LineChart className="h-5 w-5 text-primary" /><p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Research sources</p><p className="mt-1 text-2xl font-semibold">{library.sources.length}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><LineChart className="h-5 w-5 text-primary" /><p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Autonomous progress</p><p className="mt-1 text-2xl font-semibold">{marketWork.length > 0 ? `${marketProgress}%` : "Starting"}</p><p className="mt-1 text-xs text-muted-foreground">{marketWork.length > 0 ? `${completedMarketWork} of ${marketWork.length} work items complete` : "Queue initialization in progress"}</p></div>
          </section>

          <section className="space-y-4">
            <div><h2 className="text-xl font-semibold">Evidence connected to market research</h2><p className="mt-1 text-sm text-muted-foreground">Site-collected survey and interview responses count as customer-validation signals immediately. Inventor-provided files and factual statements remain marked unverified until their sources and methods are assessed; ordinary Ask InventSmith questions stay in chat history.</p></div>
            {inventorEvidence.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">No inventor evidence is connected yet. Upload a SurveyMonkey export, interview notes, or create a shareable survey page above.</div>
            ) : (
              <div className="space-y-3">
                {inventorEvidence.map((source) => {
                  const metadata = source.metadata as { extractionStatus?: string; fileSize?: number; uploadedAt?: number; evidenceOrigin?: string; validationStatus?: string; collectionStatus?: string; capturedFrom?: string; evidenceKind?: string } | undefined;
                  // Keep legacy public responses visible as site-collected even if
                  // they predate the validation metadata fields.
                  const siteCollected = metadata?.evidenceOrigin === "public_response" || metadata?.validationStatus === "counted_customer_signal";
                  const chatStatement = metadata?.capturedFrom === "ask_inventsmith";
                  const statusText = siteCollected
                    ? "Response logged from the InventSmith survey page and included in Validation refreshes."
                    : chatStatement
                      ? "Shared in Ask InventSmith and saved as an unverified factual statement; it has not been independently checked."
                      : metadata?.extractionStatus === "completed"
                        ? "Structured and available to downstream work"
                        : metadata?.extractionStatus === "running"
                          ? "Being structured for downstream work"
                          : metadata?.extractionStatus === "failed"
                            ? "Could not be structured. Open the Evidence Locker to review or retry extraction."
                            : metadata?.extractionStatus === "queued"
                              ? "Queued for structured extraction"
                              : "Inventor-provided material; source and methodology have not been independently reviewed.";
                  const evidenceBadge = siteCollected ? "Counted customer-validation signal" : chatStatement ? "Inventor-provided statement · accepted" : metadata?.evidenceKind === "survey" ? "Inventor-provided survey · accepted" : "Inventor-provided evidence · accepted";
                  return <article key={source._id} className="rounded-2xl border border-border bg-card p-5"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="font-semibold">{source.title}</h3><p className="mt-1 text-xs capitalize text-muted-foreground">{sourceEvidenceLabel(source)} · {siteCollected ? "site-collected" : source.reliability.replaceAll("_", " ")}</p></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${siteCollected ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>{evidenceBadge}</span></div>{source.excerpt && <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{source.excerpt.slice(0, 700)}{source.excerpt.length > 700 ? "…" : ""}</p>}<p className="mt-3 text-xs text-muted-foreground">{statusText}{metadata?.uploadedAt ? ` · Added ${new Date(metadata.uploadedAt).toLocaleDateString()}` : ""}</p></article>;
                })}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div><h2 className="text-xl font-semibold">Market research work status</h2><p className="mt-1 text-sm text-muted-foreground">This is where InventSmith shows whether customer, competitor and demand research is queued, running, completed or needs recovery.</p></div>
            {marketWork.length === 0 ? <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-sm"><p className="font-semibold">InventSmith is preparing Market Research automatically.</p><p className="mt-2 text-muted-foreground">{queueError ? `The queue reported: ${queueError}` : "The queue is being initialized or repaired in the background. You do not need to return to the Journey Center or press a hidden start button. This page will show queued, running, completed, or blocked work as soon as the worker reports it."}</p><Link href={`/invention/${inventionId}/chat`} className="mt-3 inline-flex text-primary underline underline-offset-4">Ask InventSmith for a plain-language status update</Link></div> : <div className="grid gap-3 md:grid-cols-2">{marketWork.map((item) => <article key={item.workItemId} className="rounded-2xl border border-border bg-card p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{item.title}</h3><span className={`rounded-full px-3 py-1 text-xs font-medium ${item.status === "failed" ? "bg-red-100 text-red-900" : item.status === "completed" ? "bg-emerald-100 text-emerald-900" : "bg-muted text-foreground"}`}>{statusLabel(item.status)}</span></div>{item.status === "failed" && <p className="mt-3 text-sm text-destructive">This work item needs recovery before a market finding can be shown.</p>}{item.status === "blocked" && item.blockedReason && <p className="mt-3 text-sm text-muted-foreground">Blocked: {item.blockedReason}</p>}{item.outputSummary && <p className="mt-3 text-sm text-muted-foreground">{item.outputSummary}</p>}</article>)}</div>}
          </section>

          <section className="space-y-4">
            <div><h2 className="text-xl font-semibold">Market and competitor work</h2><p className="mt-1 text-sm text-muted-foreground">These findings feed Validation, Patent Readiness, Product Design, Pricing, Marketing and Funding. New survey/interview evidence can make downstream conclusions stale and trigger refresh.</p></div>
            {deliverables.length === 0 && completedMarketWork === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">No completed market findings are available yet. The work-status section above shows what InventSmith is doing next; findings will appear here when the corresponding work completes.</div>
            ) : deliverables.length === 0 ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-sm"><p className="font-semibold">{noDeliverableMessage.title}</p><p className="mt-2 text-muted-foreground">{noDeliverableMessage.detail}</p></div>
            ) : (
              <div className="space-y-4">
                {deliverables.map((deliverable) => {
                  const sources = deliverable.sourceIds.flatMap((id) => { const source = sourcesById.get(String(id)); return source ? [source] : []; });
                  return (
                    <article key={deliverable._id} className="rounded-2xl border border-border bg-card p-6 sm:p-7">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{deliverable.kind.replaceAll("_", " ")} · Version {deliverable.version}</p><h3 className="mt-1 text-xl font-semibold">{deliverable.title}</h3></div><span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">{getDeliverableTrustLabel(deliverable.trustState)}</span></div>
                      {deliverable.staleReason && <p className="mt-3 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm"><span className="font-medium">Refresh needed:</span> {deliverable.staleReason}</p>}
                      <div className="mt-4"><MarkdownContent content={contentToReadableText(deliverable.content)} className="text-sm" /></div>
                      <div className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-3"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Sources</p><p className="mt-1 text-sm font-medium">{sources.length}</p></div><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Coverage</p><p className="mt-1 text-sm font-medium">{deliverable.sourceCoverage === undefined ? "Not measured" : `${Math.round(deliverable.sourceCoverage * 100)}%`}</p></div><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Confidence</p><p className="mt-1 text-sm font-medium">{deliverable.confidence === undefined ? "Not measured" : `${Math.round(deliverable.confidence * 100)}%`}</p></div></div>
                      {sources.length > 0 && <details className="mt-4"><summary className="cursor-pointer text-sm font-medium text-primary">Inspect research sources</summary><ul className="mt-3 space-y-2">{sources.map((source) => <li key={source._id} className="text-sm text-muted-foreground">{isWebLocator(source.locator) ? <a href={source.locator} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary">{source.title}<ExternalLink className="h-3.5 w-3.5" /></a> : source.title}<span className="block text-xs capitalize">{source.reliability.replaceAll("_", " ")}</span></li>)}</ul></details>}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
