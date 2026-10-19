"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { ArrowLeft, ExternalLink, FileUp, LineChart, Search, Users } from "lucide-react";
import { AppNav } from "@/components/atlas/app-nav";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import { contentToReadableText, getDeliverableTrustLabel } from "@convex/deliverableLogic";

interface DeliverableLibrary {
  invention: { _id: Id<"inventions">; title: string };
  deliverables: Array<Doc<"atlasDeliverables"> & { mediaUrl: string | null }>;
  sources: Doc<"evidenceSources">[];
  reviews: Doc<"professionalReviews">[];
  executionEvents: Doc<"atlasExecutionEvents">[];
}

const getDeliverableLibrary = makeFunctionReference<"query", { inventionId: Id<"inventions"> }, DeliverableLibrary>("inventionWorkspace:getDeliverableLibrary");
const MARKET_KINDS = new Set(["competitor_discovery", "market_feasibility"]);

function isWebLocator(locator?: string): locator is string {
  return Boolean(locator && /^https?:\/\//i.test(locator));
}

export default function MarketResearchPage() {
  const params = useParams();
  const router = useRouter();
  const inventionId = params.id as Id<"inventions">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const library = useQuery(getDeliverableLibrary, isAuthenticated && inventionId ? { inventionId } : "skip");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || library === undefined) {
    return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-5xl px-4 py-12 text-sm text-muted-foreground sm:px-6">Loading Market Research…</main></div>;
  }
  if (!library) return null;

  const deliverables = library.deliverables.filter((item) => MARKET_KINDS.has(item.kind));
  const sourcesById = new Map(library.sources.map((source) => [String(source._id), source]));
  const inventorEvidence = library.sources.filter((source) => source.metadata?.provenance === "inventor_upload");

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
            <Button asChild variant="outline"><Link href={`/invention/${inventionId}/evidence`}><FileUp className="mr-2 h-4 w-4" />Upload surveys, interviews or market evidence</Link></Button>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5"><Search className="h-5 w-5 text-primary" /><p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Market deliverables</p><p className="mt-1 text-2xl font-semibold">{deliverables.length}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><Users className="h-5 w-5 text-primary" /><p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Inventor evidence files</p><p className="mt-1 text-2xl font-semibold">{inventorEvidence.length}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><LineChart className="h-5 w-5 text-primary" /><p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Research sources</p><p className="mt-1 text-2xl font-semibold">{library.sources.length}</p></div>
          </section>

          <section className="space-y-4">
            <div><h2 className="text-xl font-semibold">Market and competitor work</h2><p className="mt-1 text-sm text-muted-foreground">These findings feed Validation, Patent Readiness, Product Design, Pricing, Marketing and Funding. New survey/interview evidence can make downstream conclusions stale and trigger refresh.</p></div>
            {deliverables.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">Market Research is visible while InventSmith works. Completed research will appear here automatically.</div>
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
