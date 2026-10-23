"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { ArrowLeft, ExternalLink, FileSearch, Gavel, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { AppNav } from "@/components/atlas/app-nav";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import { contentToReadableText, getDeliverableTrustLabel } from "@convex/deliverableLogic";
import { userFacingError } from "@/lib/userFacingError";

interface DeliverableLibrary {
  invention: { _id: Id<"inventions">; title: string };
  deliverables: Array<Doc<"atlasDeliverables"> & { mediaUrl: string | null }>;
  sources: Doc<"evidenceSources">[];
  reviews: Doc<"professionalReviews">[];
  executionEvents: Doc<"atlasExecutionEvents">[];
}

const getDeliverableLibrary = makeFunctionReference<"query", { inventionId: Id<"inventions"> }, DeliverableLibrary>("inventionWorkspace:getDeliverableLibrary");
const backfillWorkspace = makeFunctionReference<"mutation", { inventionId: Id<"inventions"> }, { addedWorkCount: number }>("inventionMigrations:backfillWorkspace");
const kickAutonomousWork = makeFunctionReference<"mutation", { inventionId: Id<"inventions">; departmentStageId?: number }, { scheduled: boolean; reason: string }>("inventionWorkspace:kickAutonomousWork");

const PATENT_KINDS = new Set([
  "preliminary_prior_art",
  "feature_prior_art_comparison",
  "distinguishing_features",
  "ip_readiness",
  "patent_design_handoff",
]);

const recordProfessionalReview = makeFunctionReference<"mutation", {
  reviewId: Id<"professionalReviews">;
  reviewerName: string;
  reviewerReference?: string;
  notes?: string;
  accepted: boolean;
}, { success: boolean; trustState: string; artifactMaturity?: string; idempotent: boolean }>("inventionWorkspace:recordProfessionalReview");

function PatentReviewAction({ review }: { review: Doc<"professionalReviews"> }) {
  const record = useMutation(recordProfessionalReview);
  const [reviewerName, setReviewerName] = useState(review.reviewerName ?? "");
  const [reviewerReference, setReviewerReference] = useState(review.reviewerReference ?? "");
  const [notes, setNotes] = useState(review.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const needsAction = review.status !== "accepted";

  const submit = async (accepted: boolean) => {
    if (!reviewerName.trim()) {
      setError("Enter the qualified reviewer’s name before recording this decision.");
      return;
    }
    if (!reviewerReference.trim()) {
      setError("Add the reviewer’s patent credentials or internal Legal reference before continuing.");
      return;
    }
    if (!notes.trim()) {
      setError(accepted ? "Add review notes describing the scope and differentiation decision." : "Add notes describing the changes Legal requires.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      await record({
        reviewId: review._id,
        reviewerName: reviewerName.trim(),
        reviewerReference: reviewerReference.trim(),
        notes: notes.trim() || undefined,
        accepted,
      });
      setMessage(accepted ? "Internal Legal review accepted and recorded." : "Internal Legal requested changes; the handoff remains paused.");
    } catch (reason) {
      setError(userFacingError(reason, "InventSmith could not record this professional review."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-5 rounded-xl border border-warning/30 bg-warning/5 p-4">
      <div className="flex items-start gap-3">
        <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">Internal Legal review {review.status === "accepted" ? "recorded" : "required"}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">A qualified patent attorney or registered patent agent in your Legal department must review the exact scope and differentiation. This administrator action records that professional decision; it is not an inventor self-certification.</p>
        </div>
      </div>
      {review.status === "accepted" && review.reviewerName && <p className="mt-3 text-xs text-muted-foreground">Accepted by {review.reviewerName}{review.reviewerReference ? ` · ${review.reviewerReference}` : ""}.</p>}
      {needsAction && <>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium">Reviewer name<input value={reviewerName} onChange={(event) => setReviewerName(event.target.value)} className="mt-1 block h-10 w-full rounded-md border border-input bg-background px-3 text-sm" placeholder="Qualified patent reviewer" /></label>
          <label className="text-xs font-medium">Credentials / reference<input value={reviewerReference} onChange={(event) => setReviewerReference(event.target.value)} className="mt-1 block h-10 w-full rounded-md border border-input bg-background px-3 text-sm" placeholder="Bar or patent-agent registration, firm, or internal record" /></label>
        </div>
        <label className="mt-3 block text-xs font-medium">Review notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Scope reviewed, differentiation conclusion, and required changes" /></label>
        <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={() => void submit(true)} disabled={submitting}>{submitting ? "Recording…" : "Record accepted review"}</Button><Button size="sm" variant="outline" onClick={() => void submit(false)} disabled={submitting}>Request changes</Button></div>
      </>}
      {message && <p role="status" className="mt-3 text-sm text-success">{message}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}

function isWebLocator(locator?: string): locator is string {
  return Boolean(locator && /^https?:\/\//i.test(locator));
}

export default function PatentReadinessPage() {
  const params = useParams();
  const router = useRouter();
  const inventionId = params.id as Id<"inventions">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const library = useQuery(getDeliverableLibrary, isAuthenticated && inventionId ? { inventionId } : "skip");
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
        await kickWork({ inventionId, departmentStageId: 4 });
      } catch (error) {
        console.error("Could not wake Patent Readiness work:", error);
      }
    })();
  }, [inventionId, isAuthenticated, isLoading, migrateWorkspace, kickWork]);

  if (isLoading || !isAuthenticated || library === undefined) {
    return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-5xl px-4 py-12 text-sm text-muted-foreground sm:px-6">Loading patent readiness workspace…</main></div>;
  }
  if (!library) return null;

  const sourcesById = new Map(library.sources.map((source) => [String(source._id), source]));
  const deliverables = library.deliverables.filter((item) => PATENT_KINDS.has(item.kind));
  const handoff = deliverables.find((item) => item.kind === "patent_design_handoff");
  const comparison = deliverables.find((item) => item.kind === "feature_prior_art_comparison");
  const distinguishing = deliverables.find((item) => item.kind === "distinguishing_features");
  const priorArt = deliverables.find((item) => item.kind === "preliminary_prior_art");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
          <Link href={`/invention/${inventionId}/journey`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to Journey Center</Link>

          <header className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Stage 4 — Patent Readiness</p>
            <h1 className="text-3xl font-bold sm:text-4xl">{library.invention.title}: prior art, differentiation and design handoff</h1>
            <p className="max-w-3xl text-muted-foreground">InventSmith keeps preliminary patent/prior-art intelligence visible here and converts it into explicit Product Design constraints. This workspace supports invention development and professional preparation; it does not claim patentability, freedom to operate, validity, or legal clearance.</p>
            <div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href={`/invention/${inventionId}/evidence`}><FileSearch className="mr-2 h-4 w-4" />Add patent or research evidence</Link></Button><Button asChild><Link href={`/invention/${inventionId}/design`}><Wrench className="mr-2 h-4 w-4" />Open Product Design + CAD</Link></Button></div>
          </header>

          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5"><FileSearch className="h-5 w-5 text-primary" /><p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Prior-art landscape</p><p className="mt-1 font-semibold">{priorArt ? "Available" : "In progress"}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><ShieldCheck className="h-5 w-5 text-primary" /><p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Feature comparison</p><p className="mt-1 font-semibold">{comparison ? "Available" : "In progress"}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><Sparkles className="h-5 w-5 text-primary" /><p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Differentiation hypotheses</p><p className="mt-1 font-semibold">{distinguishing ? "Available" : "In progress"}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><Gavel className="h-5 w-5 text-primary" /><p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Patent → Design handoff</p><p className="mt-1 font-semibold">{handoff ? "Recorded" : "Pending"}</p></div>
          </section>

          {handoff && (
            <section className="rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Design-around handoff</p>
              <h2 className="mt-2 text-xl font-semibold">Product Design is required to consume these patent-readiness constraints</h2>
              <div className="mt-4"><MarkdownContent content={contentToReadableText(handoff.content)} className="text-sm" /></div>
            </section>
          )}

          <section className="space-y-4">
            <div><h2 className="text-xl font-semibold">Patent-readiness work</h2><p className="mt-1 text-sm text-muted-foreground">InventSmith automatically searches relevant patent and non-patent sources, compares the proposed features, and converts possible conflicts into design-around constraints. Every item preserves source coverage, uncertainty and professional-review limits. Expired, abandoned or otherwise inactive references can still remain relevant prior art and therefore remain in the design comparison.</p></div>
            {deliverables.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">InventSmith has not completed the first Patent Readiness deliverable yet. The department remains visible while research runs.</div>
            ) : (
              <div className="space-y-4">
                {deliverables.map((deliverable) => {
                  const sources = deliverable.sourceIds.flatMap((id) => { const source = sourcesById.get(String(id)); return source ? [source] : []; });
                  const reviews = library.reviews.filter((review) => review.deliverableId === deliverable._id);
                  return (
                    <article key={deliverable._id} className="rounded-2xl border border-border bg-card p-6 sm:p-7">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{deliverable.kind.replaceAll("_", " ")} · Version {deliverable.version}</p><h3 className="mt-1 text-xl font-semibold">{deliverable.title}</h3></div><span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">{getDeliverableTrustLabel(deliverable.trustState)}</span></div>
                      <div className="mt-4"><MarkdownContent content={contentToReadableText(deliverable.content)} className="text-sm" /></div>
                      {reviews.filter((review) => review.specialty === "patent").map((review) => <PatentReviewAction key={review._id} review={review} />)}
                      <div className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-4"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Sources</p><p className="mt-1 text-sm font-medium">{sources.length}</p></div><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Coverage</p><p className="mt-1 text-sm font-medium">{deliverable.sourceCoverage === undefined ? "Not measured" : `${Math.round(deliverable.sourceCoverage * 100)}%`}</p></div><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Confidence</p><p className="mt-1 text-sm font-medium">{deliverable.confidence === undefined ? "Not measured" : `${Math.round(deliverable.confidence * 100)}%`}</p></div><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Professional reviews</p><p className="mt-1 text-sm font-medium">{reviews.length}</p></div></div>
                      {sources.length > 0 && <details className="mt-4"><summary className="cursor-pointer text-sm font-medium text-primary">Inspect sources</summary><ul className="mt-3 space-y-2">{sources.map((source) => <li key={source._id} className="text-sm text-muted-foreground">{isWebLocator(source.locator) ? <a href={source.locator} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary">{source.title}<ExternalLink className="h-3.5 w-3.5" /></a> : source.title}<span className="block text-xs capitalize">{source.reliability.replaceAll("_", " ")}</span></li>)}</ul></details>}
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
