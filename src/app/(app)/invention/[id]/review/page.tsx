"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { AlertTriangle, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { AppNav } from "@/components/atlas/app-nav";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewQueue {
  invention: { _id: Id<"inventions">; title: string };
  decisions: Doc<"inventionDecisions">[];
  approvals: Doc<"approvalRequests">[];
  blockedWork: Doc<"atlasWorkItems">[];
}

const getReviewQueue = makeFunctionReference<"query", { inventionId: Id<"inventions"> }, ReviewQueue>("inventionWorkspace:getReviewQueue");
const resolveDecision = makeFunctionReference<"mutation", { decisionId: Id<"inventionDecisions">; selectedOptionKey: string; rationale?: string }, { success: boolean }>("inventionWorkspace:resolveDecision");
const resolveApprovalRequest = makeFunctionReference<"mutation", { approvalRequestId: Id<"approvalRequests">; approved: boolean }, { success: boolean }>("inventionWorkspace:resolveApprovalRequest");
const respondToBlockedWork = makeFunctionReference<"mutation", { workItemId: Id<"atlasWorkItems">; response: string }, { success: boolean }>("inventionWorkspace:respondToBlockedWork");

interface DecisionOption { key: string; label: string; description: string; }

function readDecisionOptions(options: unknown[]): DecisionOption[] {
  return options.flatMap((option) => {
    if (!option || typeof option !== "object") return [];
    const value = option as Record<string, unknown>;
    if (typeof value.key !== "string" || typeof value.label !== "string") return [];
    return [{ key: value.key, label: value.label, description: typeof value.description === "string" ? value.description : "" }];
  });
}

function ReviewSkeleton() {
  return <div className="mx-auto max-w-3xl animate-pulse space-y-6 px-4 py-12 sm:px-6"><div className="h-5 w-36 rounded bg-muted" /><div className="h-10 w-2/3 rounded bg-muted" /><div className="h-72 rounded-2xl bg-muted" /></div>;
}

export default function InventionReviewPage() {
  const params = useParams();
  const router = useRouter();
  const inventionId = params.id as Id<"inventions">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const decide = useMutation(resolveDecision);
  const approve = useMutation(resolveApprovalRequest);
  const respond = useMutation(respondToBlockedWork);
  const queue = useQuery(getReviewQueue, isAuthenticated && inventionId ? { inventionId } : "skip");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [rationale, setRationale] = useState("");
  const [humanResponse, setHumanResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push("/sign-in"); }, [isAuthenticated, isLoading, router]);

  const currentDecision = queue?.decisions[0];
  const currentApproval = queue?.approvals[0];
  const currentBlockedWork = queue?.blockedWork[0];
  const options = useMemo(() => readDecisionOptions(currentDecision?.options ?? []), [currentDecision]);

  useEffect(() => {
    setSelectedOption(currentDecision?.recommendedOptionKey ?? "");
    setRationale("");
    setError(null);
  }, [currentDecision?._id, currentDecision?.recommendedOptionKey]);

  const handleDecision = async () => {
    if (!currentDecision || !selectedOption) return;
    setSubmitting(true); setError(null);
    try { await decide({ decisionId: currentDecision._id, selectedOptionKey: selectedOption, rationale: rationale.trim() || undefined }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "InventSmith could not record this decision."); }
    finally { setSubmitting(false); }
  };

  const handleApproval = async (approved: boolean) => {
    if (!currentApproval) return;
    setSubmitting(true); setError(null);
    try { await approve({ approvalRequestId: currentApproval._id, approved }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "InventSmith could not record this response."); }
    finally { setSubmitting(false); }
  };

  const handleBlockedWork = async () => {
    if (!currentBlockedWork || !humanResponse.trim()) return;
    setSubmitting(true); setError(null);
    try { await respond({ workItemId: currentBlockedWork._id, response: humanResponse.trim() }); setHumanResponse(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "InventSmith could not record this input."); }
    finally { setSubmitting(false); }
  };

  if (isLoading || !isAuthenticated || queue === undefined) return <div className="min-h-screen bg-background"><AppNav /><ReviewSkeleton /></div>;
  if (!queue) return null;
  const remainingCount = queue.decisions.length + queue.approvals.length + queue.blockedWork.length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to briefing</Link>
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Inventor review</p>
            <h1 className="text-3xl font-bold sm:text-4xl">{queue.invention.title}</h1>
            <p className="text-muted-foreground">InventSmith pauses here because this step requires your judgment or authorization.</p>
          </header>

          {currentDecision ? (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8" aria-labelledby="decision-title">
              <div className="mb-6 flex items-start justify-between gap-4"><div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-widest text-primary">Decision required</p><h2 id="decision-title" className="text-2xl font-semibold">{currentDecision.title}</h2><p className="leading-relaxed text-muted-foreground">{currentDecision.question}</p></div><span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{remainingCount} remaining</span></div>
              <fieldset className="space-y-3"><legend className="sr-only">Choose an option</legend>{options.map((option) => { const recommended = option.key === currentDecision.recommendedOptionKey; return <label key={option.key} className={`block cursor-pointer rounded-xl border p-4 transition-colors ${selectedOption === option.key ? "border-primary bg-accent/60" : "border-border hover:bg-muted/40"}`}><span className="flex items-start gap-3"><input type="radio" name="decision-option" value={option.key} checked={selectedOption === option.key} onChange={() => setSelectedOption(option.key)} className="mt-1 accent-[var(--primary)]" /><span className="min-w-0"><span className="flex flex-wrap items-center gap-2 font-medium text-foreground">{option.label}{recommended && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">InventSmith recommends</span>}</span>{option.description && <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{option.description}</span>}</span></span></label>; })}</fieldset>
              <div className="mt-6 space-y-2"><label htmlFor="decision-rationale" className="text-sm font-medium">Why are you choosing this? <span className="font-normal text-muted-foreground">Optional</span></label><Textarea id="decision-rationale" value={rationale} onChange={(event) => setRationale(event.target.value)} placeholder="Record any reasoning InventSmith should remember…" rows={3} /></div>
              {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}<div className="mt-6 flex justify-end"><Button onClick={handleDecision} disabled={!selectedOption || submitting}>{submitting ? "Recording…" : "Confirm decision"}</Button></div>
            </section>
          ) : currentApproval ? (
            <section className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm sm:p-8" aria-labelledby="approval-title">
              <div className="flex items-start gap-4"><div className="rounded-full bg-accent p-3"><ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" /></div><div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-widest text-primary">Authorization required</p><h2 id="approval-title" className="text-2xl font-semibold">Review before InventSmith proceeds</h2><p className="leading-relaxed text-foreground">{currentApproval.summary}</p></div></div>
              {currentApproval.consequences.length > 0 && <div className="mt-6 rounded-xl border border-warning/30 bg-warning/5 p-4"><div className="flex items-center gap-2 text-sm font-medium"><AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />What approval allows</div><ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{currentApproval.consequences.map((consequence) => <li key={consequence}>{consequence}</li>)}</ul></div>}
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Approval records your authorization. InventSmith will still log the resulting action separately; it does not imply professional approval or guarantee an outcome.</p>
              {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="outline" onClick={() => handleApproval(false)} disabled={submitting}>Decline</Button><Button onClick={() => handleApproval(true)} disabled={submitting}>{submitting ? "Recording…" : "Approve action"}</Button></div>
            </section>
          ) : currentBlockedWork ? (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8" aria-labelledby="blocked-work-title">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Minimum input needed</p><h2 id="blocked-work-title" className="mt-2 text-2xl font-semibold">{currentBlockedWork.title}</h2><p className="mt-3 leading-relaxed text-muted-foreground">{currentBlockedWork.blockedReason}</p><p className="mt-2 text-xs capitalize text-muted-foreground">Gate type: {(currentBlockedWork.humanGateType ?? "decision").replaceAll("_", " ")}</p>
              <div className="mt-6 space-y-2"><label htmlFor="blocked-work-response" className="text-sm font-medium">Your response</label><Textarea id="blocked-work-response" value={humanResponse} onChange={(event) => setHumanResponse(event.target.value)} maxLength={4000} rows={5} placeholder="Provide only the information or decision InventSmith requested…" /></div><p className="mt-3 text-xs text-muted-foreground">After you submit, InventSmith will resume this work automatically.</p>
              {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}<div className="mt-6 flex justify-end"><Button onClick={handleBlockedWork} disabled={!humanResponse.trim() || submitting}>{submitting ? "Resuming…" : "Submit and resume InventSmith"}</Button></div>
            </section>
          ) : (
            <section className="rounded-2xl border border-success/25 bg-success/5 p-8 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden="true" /><h2 className="mt-4 text-2xl font-semibold">You are all caught up</h2><p className="mt-2 text-muted-foreground">InventSmith does not need another decision or authorization right now.</p><Button asChild className="mt-6"><Link href="/dashboard">Return to briefing</Link></Button></section>
          )}
        </div>
      </main>
      <footer className="border-t border-border"><MadeThisBadge /></footer>
    </div>
  );
}
