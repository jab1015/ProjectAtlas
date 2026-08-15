"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { AlertTriangle, ArrowLeft, BookOpen, CheckCircle2, Download, ExternalLink, FileCheck2, ShieldAlert } from "lucide-react";
import { AppNav } from "@/components/atlas/app-nav";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import {
  contentToReadableText,
  getDeliverableTrustLabel,
  isDeliverableReadyForExternalUse,
} from "@convex/deliverableLogic";
import { selectLatestDeliverables } from "@/lib/packageExportLogic";
import type { AtlasPackageExport } from "@/lib/packageExport";

interface DeliverableLibrary {
  invention: { _id: Id<"inventions">; title: string };
  deliverables: Array<Doc<"atlasDeliverables"> & { mediaUrl: string | null }>;
  sources: Doc<"evidenceSources">[];
  reviews: Doc<"professionalReviews">[];
  executionEvents: Doc<"atlasExecutionEvents">[];
}

const getDeliverableLibrary = makeFunctionReference<
  "query",
  { inventionId: Id<"inventions"> },
  DeliverableLibrary
>("inventionWorkspace:getDeliverableLibrary");

interface PilotEvaluation {
  score: number;
  passed: boolean;
  blockers: string[];
  metrics: { requiredDeliverables: number; missingDeliverables: number; evidenceCheckedRatio: number };
}

const getPilotEvaluation = makeFunctionReference<
  "query",
  { inventionId: Id<"inventions"> },
  PilotEvaluation
>("inventionWorkspace:getPilotEvaluation");

function WorkSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-6 px-4 py-12 sm:px-6">
      <div className="h-5 w-32 rounded bg-muted" />
      <div className="h-11 w-2/3 rounded bg-muted" />
      <div className="h-64 rounded-2xl bg-muted" />
    </div>
  );
}

function isWebLocator(locator?: string): locator is string {
  return Boolean(locator && /^https?:\/\//i.test(locator));
}

function downloadMarkdown(title: string, version: number, content: string) {
  const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "atlas-deliverable";
  const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeName}-v${version}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function InventionWorkPage() {
  const params = useParams();
  const router = useRouter();
  const inventionId = params.id as Id<"inventions">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [exportError, setExportError] = useState<string | null>(null);
  const library = useQuery(
    getDeliverableLibrary,
    isAuthenticated && inventionId ? { inventionId } : "skip"
  );
  const evaluation = useQuery(
    getPilotEvaluation,
    isAuthenticated && inventionId ? { inventionId } : "skip"
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || library === undefined || evaluation === undefined) {
    return <div className="min-h-screen bg-background"><AppNav /><WorkSkeleton /></div>;
  }
  if (!library) return null;

  const sourcesById = new Map(library.sources.map((source) => [String(source._id), source]));
  const packageExport: AtlasPackageExport = {
    inventionTitle: library.invention.title,
    generatedAt: Date.now(),
    qualityPassed: evaluation.passed,
    qualityBlockers: evaluation.blockers,
    deliverables: selectLatestDeliverables(library.deliverables).map((deliverable) => ({
      kind: deliverable.kind,
      title: deliverable.title,
      version: deliverable.version,
      trustLabel: getDeliverableTrustLabel(deliverable.trustState),
      content: contentToReadableText(deliverable.content),
      sourceCoverage: deliverable.sourceCoverage,
      confidence: deliverable.confidence,
      searchDate: deliverable.searchDate,
      staleReason: deliverable.staleReason,
      assumptions: deliverable.assumptions,
      limitations: deliverable.limitations,
      missingInformation: deliverable.missingInformation ?? [],
      sources: deliverable.sourceIds.flatMap((sourceId) => {
        const source = sourcesById.get(String(sourceId));
        return source ? [{ id: String(source._id), title: source.title, locator: source.locator, reliability: source.reliability }] : [];
      }),
      reviews: library.reviews.filter((review) => review.deliverableId === deliverable._id).map((review) => ({
        specialty: review.specialty,
        status: review.status,
        scope: review.scope,
        reviewerName: review.reviewerName,
        reviewerReference: review.reviewerReference,
        notes: review.notes,
      })),
    })),
  };
  const runExport = async (format: "docx" | "pdf") => {
    setExportError(null);
    try {
      const exporters = await import("@/lib/packageExport");
      if (format === "docx") await exporters.exportAtlasPackageDocx(packageExport);
      else await exporters.exportAtlasPackagePdf(packageExport);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Atlas could not export this package.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to briefing
          </Link>

          <header className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Atlas work library</p>
            <h1 className="text-3xl font-bold sm:text-4xl">{library.invention.title}</h1>
            <p className="max-w-2xl text-muted-foreground">
              Review completed work, supporting evidence, assumptions, limitations, revisions, and any professional review required before use.
            </p>
            {library.deliverables.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2" onClick={() => void runExport("docx")}><Download className="h-4 w-4" />Export package .docx</Button>
                <Button variant="outline" className="gap-2" onClick={() => void runExport("pdf")}><Download className="h-4 w-4" />Export package .pdf</Button>
              </div>
            )}
            {exportError && <p role="alert" className="text-sm text-destructive">{exportError}</p>}
          </header>

          {library.deliverables.length === 0 ? (
            <section className="rounded-2xl border border-border bg-card p-8 text-center">
              <BookOpen className="mx-auto h-9 w-9 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold">Atlas is preparing the first deliverables</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                Finished work will appear here automatically. Atlas will show its evidence and limitations rather than asking you to assemble the report.
              </p>
              <Button asChild variant="outline" className="mt-6"><Link href="/dashboard">Return to briefing</Link></Button>
            </section>
          ) : (
            <div className="space-y-5">
              {library.deliverables.map((deliverable) => {
                const sources = deliverable.sourceIds.flatMap((sourceId) => {
                  const source = sourcesById.get(String(sourceId));
                  return source ? [source] : [];
                });
                const reviews = library.reviews.filter((review) => review.deliverableId === deliverable._id);
                const readyForUse = isDeliverableReadyForExternalUse(deliverable.trustState, deliverable.staleReason);
                const readableContent = contentToReadableText(deliverable.content);

                return (
                  <article key={deliverable._id} className="rounded-2xl border border-border bg-card shadow-sm">
                    <div className="space-y-4 p-6 sm:p-7">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{deliverable.kind.replaceAll("_", " ")} · Version {deliverable.version}</p>
                          <h2 className="mt-1 text-2xl font-semibold">{deliverable.title}</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {readableContent && <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadMarkdown(deliverable.title, deliverable.version, readableContent)}><Download className="h-4 w-4" />Export .md</Button>}
                          <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${readyForUse ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                            {getDeliverableTrustLabel(deliverable.trustState)}
                          </span>
                        </div>
                      </div>

                      {deliverable.staleReason && (
                        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm">
                          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                          <p><span className="font-medium">Needs refresh:</span> {deliverable.staleReason}</p>
                        </div>
                      )}

                      {deliverable.mediaUrl && (
                        <figure className="overflow-hidden rounded-xl border border-border bg-muted/30">
                          {/* Convex storage URLs are signed dynamically and cannot be listed as a static Next image host. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={deliverable.mediaUrl} alt={`${deliverable.title} — concept visualization`} className="h-auto w-full" />
                          <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground">
                            <span className="capitalize">{deliverable.artifactMaturity?.replaceAll("_", " ") ?? "Concept visualization"}</span>
                            <a href={deliverable.mediaUrl} download target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary"><Download className="h-3.5 w-3.5" />Download image</a>
                          </figcaption>
                        </figure>
                      )}

                      {readableContent ? (
                        <MarkdownContent content={readableContent} className="text-sm" />
                      ) : (
                        <p className="text-sm text-muted-foreground">This deliverable has no readable content yet.</p>
                      )}

                      <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-5">
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sources</p><p className="mt-1 text-sm">{sources.length}</p></div>
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coverage</p><p className="mt-1 text-sm">{deliverable.sourceCoverage === undefined ? "Not measured" : `${Math.round(deliverable.sourceCoverage * 100)}%`}</p></div>
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confidence</p><p className="mt-1 text-sm">{deliverable.confidence === undefined ? "Not measured" : `${Math.round(deliverable.confidence * 100)}%`}</p></div>
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assumptions</p><p className="mt-1 text-sm">{deliverable.assumptions.length}</p></div>
                        <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Professional reviews</p><p className="mt-1 text-sm">{reviews.length}</p></div>
                      </div>
                    </div>

                    <details className="border-t border-border px-6 py-4 sm:px-7">
                      <summary className="cursor-pointer text-sm font-medium text-primary">Inspect evidence and limitations</summary>
                      <div className="mt-5 grid gap-6 md:grid-cols-2">
                        <div>
                          <h3 className="text-sm font-semibold">Sources</h3>
                          {sources.length ? (
                            <ul className="mt-2 space-y-2">
                              {sources.map((source) => (
                                <li key={source._id} className="text-sm text-muted-foreground">
                                  {isWebLocator(source.locator) ? (
                                    <a href={source.locator} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                                      {source.title}<ExternalLink className="h-3 w-3" aria-hidden="true" />
                                    </a>
                                  ) : (
                                    <span>{source.title}{source.locator ? ` — ${source.locator}` : ""}</span>
                                  )}
                                  <span className="block text-xs capitalize">{source.reliability.replaceAll("_", " ")}</span>
                                </li>
                              ))}
                            </ul>
                          ) : <p className="mt-2 text-sm text-muted-foreground">No sources are attached yet.</p>}
                        </div>

                        <div className="space-y-5">
                          <div>
                            <h3 className="text-sm font-semibold">Assumptions</h3>
                            {deliverable.assumptions.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{deliverable.assumptions.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">None recorded.</p>}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold">Limitations</h3>
                            {deliverable.limitations.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{deliverable.limitations.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">None recorded.</p>}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold">Research status</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Search date: {deliverable.searchDate ? new Date(deliverable.searchDate).toLocaleDateString() : "Not recorded"}</p>
                            {deliverable.missingInformation?.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{deliverable.missingInformation.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No missing information recorded.</p>}
                          </div>
                        </div>

                        {reviews.length > 0 && (
                          <div className="md:col-span-2">
                            <h3 className="flex items-center gap-2 text-sm font-semibold"><FileCheck2 className="h-4 w-4 text-primary" aria-hidden="true" />Professional review</h3>
                            <ul className="mt-2 space-y-2">{reviews.map((review) => <li key={review._id} className="rounded-lg bg-muted/50 p-3 text-sm"><span className="font-medium capitalize">{review.specialty}</span> · <span className="capitalize text-muted-foreground">{review.status.replaceAll("_", " ")}</span><p className="mt-1 text-muted-foreground">{review.scope}</p></li>)}</ul>
                          </div>
                        )}
                      </div>
                    </details>
                  </article>
                );
              })}
            </div>
          )}

          <section className={`rounded-2xl border p-6 sm:p-7 ${evaluation.passed ? "border-success/25 bg-success/5" : "border-warning/30 bg-warning/5"}`} aria-labelledby="package-quality-title">
            <div className="flex items-start gap-3">
              {evaluation.passed ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />}
              <div className="min-w-0 flex-1">
                <h2 id="package-quality-title" className="text-xl font-semibold">Package quality checks</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {evaluation.passed
                    ? "The current package passes Atlas’s automated completeness and evidence-integrity checks. Professional review requirements still apply."
                    : `${evaluation.metrics.missingDeliverables} of ${evaluation.metrics.requiredDeliverables} required deliverables are still missing, or another integrity check needs attention.`}
                </p>
                {!evaluation.passed && evaluation.blockers.length > 0 && (
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-foreground">
                    {evaluation.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
                  </ul>
                )}
                <p className="mt-3 text-xs text-muted-foreground">These checks do not constitute patentability, legal, regulatory, or engineering approval.</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-7" aria-labelledby="execution-history-title">
            <h2 id="execution-history-title" className="text-xl font-semibold">Atlas execution history</h2>
            <p className="mt-1 text-sm text-muted-foreground">A chronological audit trail of work, gates, decisions, and costs. Project text and hidden prompts are not exposed here.</p>
            {library.executionEvents.length ? (
              <ol className="mt-5 space-y-3">
                {library.executionEvents.map((event) => (
                  <li key={event._id} className="flex gap-3 border-l-2 border-border pl-4 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium capitalize">{event.eventType.replaceAll("_", " ")}</p>
                      <p className="text-muted-foreground">{event.summary}</p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                      <p>{new Date(event.createdAt).toLocaleString()}</p>
                      {event.costUnits !== undefined && <p>{event.costUnits} cost unit{event.costUnits === 1 ? "" : "s"}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            ) : <p className="mt-4 text-sm text-muted-foreground">Execution events will appear when Atlas begins work.</p>}
          </section>
        </div>
      </main>
      <footer className="border-t border-border"><MadeThisBadge /></footer>
    </div>
  );
}
