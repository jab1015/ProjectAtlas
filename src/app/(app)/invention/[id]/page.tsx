"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { AppNav } from "@/components/atlas/app-nav";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { ReadinessBadge } from "@/components/atlas/readiness-badge";
import { JourneyMap } from "@/components/atlas/journey-map";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Mail, MessageSquare, PartyPopper, RefreshCw, Share2 } from "lucide-react";
import Link from "next/link";
import { trackStageCompleted, trackContinueClicked } from "@/lib/analytics";
import { InventionCardMenu } from "@/components/atlas/invention-card-menu";
import { getSafeValidationFailureMessage, getValidationCompletionLabel, getValidationResearchViewState } from "@/lib/validationResearchView";
import { makeFunctionReference } from "convex/server";

const PUBLIC_SURVEY_APP_URL = (process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? "https://inventsmith.vercel.app").replace(/\/+$/, "");

function getPublicSurveyUrl(token: string): string {
  return `${PUBLIC_SURVEY_APP_URL}/respond/${token}`;
}

const createEvidenceRequestRef = makeFunctionReference<"mutation", { inventionId: Id<"inventions">; kind: "survey" | "interview"; title?: string; introduction?: string }, { requestId: string; token: string }>("evidenceRequests:create");
const listEvidenceRequestsRef = makeFunctionReference<"query", { inventionId: Id<"inventions"> }, Array<{ token: string; kind: "survey" | "interview"; title: string; purpose?: string; status: string }>>("evidenceRequests:list");

async function copyTextToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the compatibility path below.
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.fontSize = "16px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, value.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  textarea.remove();
  return copied;
}

// ── Congratulations screen (Stage 4 completion) ──────────────────────────────

function CongratulatoryScreen({ inventionTitle, inventionId }: { inventionTitle: string; inventionId: string }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-md">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center border-2 border-primary/20">
              <PartyPopper className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-primary">
              Foundation complete
            </p>
            <h1
              className="text-3xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
            >
              {inventionTitle} is ready for the next department.
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Your idea and validation work is saved. InventSmith will guide you through the remaining departments and show what each one needs next.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-5 text-left space-y-2">
            <p className="text-sm font-medium text-foreground">What happens next</p>
            <p className="text-sm text-muted-foreground">Open your journey to see the next department, its work, and any evidence or approval it needs.</p>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href={`/invention/${inventionId}/journey`}>Continue to my journey</Link>
          </Button>
        </div>
      </main>
      <footer className="border-t border-border">
        <MadeThisBadge />
      </footer>
    </div>
  );
}

// ── Field definitions per stage ─────────────────────────────────────────────

interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea";
}

const STAGE_FIELDS: Record<number, FieldDef[]> = {
  1: [
    { key: "problemStatement", label: "What problem does your invention solve?", placeholder: "Describe the problem…", type: "textarea" },
    { key: "targetAudience", label: "Who experiences this problem most?", placeholder: "Describe your target audience…", type: "textarea" },
    { key: "solutionDescription", label: "How does your invention solve it?", placeholder: "Describe your solution…", type: "textarea" },
    { key: "title", label: "Working title", placeholder: "Invention title…", type: "text" },
  ],
  2: [
    { key: "validationMethod", label: "What method will you use to validate demand?", placeholder: "e.g. customer interviews, landing page test, pre-orders…", type: "text" },
    { key: "targetMarketSize", label: "Estimate your target market size.", placeholder: "e.g. 50M people in the US spend $2B/yr on…", type: "text" },
    { key: "competitorAnalysis", label: "Who are your top 3 competitors or alternatives?", placeholder: "List them and what they get right/wrong…", type: "text" },
  ],
  3: [
    { key: "marketSegment", label: "Which market segment is your primary target?", placeholder: "e.g. small business owners in manufacturing…", type: "text" },
    { key: "customerPersona", label: "Describe your ideal customer.", placeholder: "Age, role, pain points, buying behavior…", type: "text" },
    { key: "pricePoint", label: "What price would your customer pay?", placeholder: "e.g. $49 one-time / $19/mo / $500 enterprise…", type: "text" },
  ],
  4: [
    { key: "priorArtSearch", label: "Have you searched for prior art? Summarize what you found.", placeholder: "e.g. Searched USPTO, Google Patents. Found 3 similar patents from 2015, but none cover…", type: "textarea" },
    { key: "patentabilityAssessment", label: "Do you believe your invention is novel and non-obvious? Why?", placeholder: "Explain what makes your invention different from existing patents…", type: "textarea" },
    { key: "inventionDisclosure", label: "Write a brief invention disclosure statement.", placeholder: "A clear description of the invention, the problem it solves, and how it works — enough for a patent attorney to evaluate…", type: "textarea" },
  ],
};

// ── Stage 1 field values come from the invention record itself ───────────────
// Other stages use stageProgress. This function flattens them for display.

function getStage1Values(
  invention: { title: string; problemStatement?: string; targetAudience?: string; solutionDescription?: string } | null
): Record<string, string> {
  if (!invention) return {};
  return {
    title: invention.title ?? "",
    problemStatement: invention.problemStatement ?? "",
    targetAudience: invention.targetAudience ?? "",
    solutionDescription: invention.solutionDescription ?? "",
  };
}

// ── Main workspace ───────────────────────────────────────────────────────────

export default function InventionWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const inventionId = params.id as Id<"inventions">;

  const { isAuthenticated, isLoading } = useConvexAuth();
  const updateStageProgress = useMutation(api.journeyEngine.updateStageProgress);
  const updateInventionField = useMutation(api.journeyEngine.updateInventionField);
  const advanceStage = useMutation(api.journeyEngine.advanceStage);
  const forceRegenerateValidation = useMutation(api.validationResearchSessionMutations.forceRegenerateValidation);
  const retryFailedValidation = useMutation(api.validationResearchSessionMutations.retryFailedValidationSections);
  const createEvidenceRequest = useMutation(createEvidenceRequestRef);
  const evidenceRequests = useQuery(listEvidenceRequestsRef, isAuthenticated && inventionId ? { inventionId } : "skip");

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [advancing, setAdvancing] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildError, setRebuildError] = useState<string | null>(null);
  const [surveyPreparationError, setSurveyPreparationError] = useState<string | null>(null);
  const [surveyShareMessage, setSurveyShareMessage] = useState<string | null>(null);
  const rebuildTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);
  const autoSurveyAttemptedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  const inventionState = useQuery(
    api.journeyEngine.getInventionState,
    isAuthenticated && inventionId ? { inventionId } : "skip"
  );

  const validationResearch = useQuery(
    api.validationMutations.getValidationResearch,
    isAuthenticated && inventionId ? { inventionId } : "skip"
  );

  const reportSections = validationResearch?.sections ?? [];
  const reportConfidenceScores = reportSections
    .filter((section) => section.status !== "pending" && typeof section.confidence?.score === "number")
    .map((section) => section.confidence.score);
  const reportConfidenceAverage = reportConfidenceScores.length
    ? reportConfidenceScores.reduce((sum, score) => sum + score, 0) / reportConfidenceScores.length
    : null;
  const reportIsCurrentAndComplete = validationResearch?.status === "complete"
    && validationResearch.evidenceReview?.currentEvidenceMatchesRun === true
    && reportSections.length >= 11
    && reportSections.every((section) => section.status === "generated");

  useEffect(() => {
    if (autoSurveyAttemptedRef.current || !isAuthenticated || !reportIsCurrentAndComplete || reportConfidenceAverage === null || reportConfidenceAverage > 0.5 || !inventionState || !Array.isArray(evidenceRequests)) return;
    const fallbackTitle = `[Validation follow-up] ${inventionState.invention.title}`;
    const existing = evidenceRequests.find((request) => request.kind === "survey" && request.status === "active" && (request.purpose === "validation_follow_up" || request.title === fallbackTitle));
    if (existing) {
      autoSurveyAttemptedRef.current = true;
      return;
    }
    autoSurveyAttemptedRef.current = true;
    setSurveyPreparationError(null);
    const idea = inventionState.invention;
    const details = [idea.problemStatement?.trim(), idea.solutionDescription?.trim()].filter(Boolean).join(" A possible solution is: ");
    void createEvidenceRequest({
      inventionId,
      kind: "survey",
      title: fallbackTitle,
      introduction: `InventSmith prepared this short survey because the current evidence score is ${Math.round(reportConfidenceAverage * 100)}%. Please share it with people who may have this problem${details ? `: ${details.slice(0, 320)}` : ""}. Responses are saved as inventor-provided evidence and are not independently verified.`,
    }).catch((error) => {
      console.error("Could not prepare the validation follow-up survey:", error);
      setSurveyPreparationError("InventSmith could not prepare the survey link. Open Evidence Locker to create a survey page.");
      autoSurveyAttemptedRef.current = false;
    });
  }, [createEvidenceRequest, evidenceRequests, inventionId, inventionState, isAuthenticated, reportConfidenceAverage, reportIsCurrentAndComplete]);

  // Initialize local field values from server state
  useEffect(() => {
    if (initializedRef.current || !inventionState) return;
    initializedRef.current = true;

    const { currentStage, completedFields, invention } = inventionState;

    if (currentStage.id === 1) {
      setFieldValues(getStage1Values(invention));
    } else {
      // For other stages, we don't have the values directly — just which fields are complete
      // The user will fill them in as text inputs
      const initial: Record<string, string> = {};
      completedFields.forEach((f) => (initial[f] = "✓")); // mark as done
      setFieldValues(initial);
    }
  }, [inventionState]);

  // ── Stage 2: Rebuild Validation handler ──────────────────────────────────────
  // IMPORTANT: hooks must be called before any conditional early returns (Rules of Hooks).
  const handleRebuildValidation = useCallback(async () => {
    setRebuildError(null);
    setRebuilding(true);
    // Safety timeout: stop spinning after 120s even if something hangs
    if (rebuildTimeoutRef.current) clearTimeout(rebuildTimeoutRef.current);
    rebuildTimeoutRef.current = setTimeout(() => setRebuilding(false), 120_000);
    try {
      const retry = await retryFailedValidation({ inventionId });
      if (!retry.queued) await forceRegenerateValidation({ inventionId });
      // Keep rebuilding=true — the reactive query will update as sections come in
    } catch (err) {
      console.error("Rebuild failed:", err);
      const msg = err instanceof Error ? err.message : "Rebuild failed. Please try again.";
      setRebuildError(msg);
      setRebuilding(false);
      if (rebuildTimeoutRef.current) clearTimeout(rebuildTimeoutRef.current);
    }
  }, [forceRegenerateValidation, inventionId, retryFailedValidation]);

  const shareSurvey = useCallback(async (token: string) => {
    const url = getPublicSurveyUrl(token);
    setSurveyShareMessage(null);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Rise Jar validation survey`,
          text: `Please take this short survey to help validate the invention:`,
          url,
        });
        setSurveyShareMessage("Share sheet opened.");
        return;
      }
      const copied = await copyTextToClipboard(url);
      setSurveyShareMessage(copied ? "Survey link copied." : "Copy was unavailable. Use the email or text option below.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setSurveyShareMessage("Share was unavailable. Use the email or text option below.");
    }
  }, []);

  const TOTAL_SECTIONS = 11;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sectionsList = (validationResearch?.sections ?? []) as Array<any>;
  const completedSectionCount = sectionsList.filter((s) => s.status !== "pending").length;

  // When rebuilding: switch off once all sections are back (via useEffect to avoid setState-during-render)
  useEffect(() => {
    if (rebuilding && completedSectionCount >= TOTAL_SECTIONS) {
      setRebuilding(false);
      if (rebuildTimeoutRef.current) clearTimeout(rebuildTimeoutRef.current);
    }
  }, [rebuilding, completedSectionCount]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (rebuildTimeoutRef.current) clearTimeout(rebuildTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (inventionState && inventionState.currentStage.id > 4) {
      router.replace(`/invention/${inventionId}/journey`);
    }
  }, [inventionId, inventionState, router]);

  if (isLoading || !isAuthenticated || inventionState === undefined) {
    return (
      <div className="min-h-screen min-w-0 flex flex-col bg-background">
        <AppNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading…</div>
        </main>
      </div>
    );
  }

  if (!inventionState) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Invention not found.</p>
            <Button asChild>
              <Link href="/inventions">My Inventions</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { invention, currentStage, readinessState, nextAction, completedFields } = inventionState;
  const stageId = currentStage.id;
  const fields = STAGE_FIELDS[stageId];

  // ── Stage 2: Validation Research Status (replaces questionnaire) ─────────────
  if (stageId === 2) {
    const {
      finishedSections: completedSections,
      failedSections,
      isGenerating,
      allSectionsError,
      progressCount,
      progressPct,
      statusLabel,
    } = getValidationResearchViewState(validationResearch, rebuilding, TOTAL_SECTIONS);

    // Summary stats
    const sectionsWithConf = completedSections.filter(
      (s) => typeof s.confidence?.score === "number"
    );
    const surveyEvidenceIncluded = completedSections.some((section) =>
      /survey evidence|survey observations strengthen/i.test(section.confidence?.evidenceSummary ?? "")
    );
    const evidenceReview = (validationResearch as { evidenceReview?: { currentEvidenceMatchesRun: boolean; surveys: Array<{ title: string; sampleSize?: string; summary: string; findings: string[]; provenance: string }>; pendingSurveys?: Array<{ title: string; status: "processing" | "failed" }> } } | null)?.evidenceReview;
    const uploadedSurveys = evidenceReview?.surveys ?? [];
    const avgConfidence =
      sectionsWithConf.length > 0
        ? `${Math.round(
            (sectionsWithConf.reduce(
              (sum, s) => sum + (s.confidence?.score ?? 0),
              0
            ) /
              sectionsWithConf.length) *
              100
          )}%`
        : "—";
    const researchTs =
      (validationResearch as { completedAt?: number; triggeredAt?: number } | null)
        ?.completedAt ??
      (validationResearch as { completedAt?: number; triggeredAt?: number } | null)
        ?.triggeredAt;
    const researchDateStr = researchTs
      ? new Date(researchTs).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

    return (
      <div className="min-h-screen min-w-0 flex flex-col bg-background">
        <AppNav />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>

            {/* Status screen */}
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-widest text-primary">
                  Stage 2 — Validation
                </p>
                <InventionCardMenu
                  inventionId={inventionId}
                  inventionTitle={invention.title}
                  onDeleted={() => router.push("/onboarding")}
                />
              </div>
              <h1
                className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
              >
                InventSmith is validating your invention.
              </h1>
              <p className="text-muted-foreground">
                {evidenceReview?.currentEvidenceMatchesRun === false
                  ? isGenerating
                    ? "The report shown does not match the latest evidence. A refresh is running; confidence will stay hidden until the current evidence is reflected in a completed report."
                    : "The report shown does not match the latest evidence. Use Refresh validation to generate an updated report; confidence will stay hidden until the current evidence is reflected."
                  : isGenerating
                  ? "Your research is being prepared. You can come back when it finishes."
                  : allSectionsError
                  ? "This attempt did not produce usable research."
                  : "Here is the short version first. You can open the full report if you want more detail."}
              </p>
              <p className="text-sm text-foreground">
                Status: <span className="font-medium">{statusLabel}</span>
              </p>
              {reportIsCurrentAndComplete && reportConfidenceAverage !== null && reportConfidenceAverage <= 0.5 && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                  <p className="font-semibold text-foreground">Your next step</p>
                  <p className="mt-1 text-muted-foreground">Your evidence score is {Math.round(reportConfidenceAverage * 100)}%. InventSmith has prepared a short survey. Share it with five people who might have this problem.</p>
                  {(() => {
                    const request = evidenceRequests?.find((item) => item.kind === "survey" && item.status === "active" && (item.purpose === "validation_follow_up" || item.title === `[Validation follow-up] ${invention.title}`));
                    return request ? (
                      <div className="mt-3 space-y-2">
                        <p className="break-all rounded-md bg-background px-3 py-2 font-mono text-xs">{typeof window !== "undefined" ? getPublicSurveyUrl(request.token) : getPublicSurveyUrl(request.token)}</p>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => { void copyTextToClipboard(getPublicSurveyUrl(request.token)).then((copied) => setSurveyShareMessage(copied ? "Copied! The survey link is ready to paste." : "Copy was unavailable. Use the share options below.")); }} className={surveyShareMessage?.startsWith("Copied!") ? "border-primary bg-primary/10 text-primary" : ""}>{surveyShareMessage?.startsWith("Copied!") ? "Copied!" : "Copy survey link"}</Button>
                          <Button size="sm" variant="outline" onClick={() => void shareSurvey(request.token)}><Share2 className="mr-1.5 h-3.5 w-3.5" />Share survey</Button>
                          <Button asChild size="sm" variant="outline"><a href={`sms:?body=${encodeURIComponent(`Please take this short Rise Jar validation survey: ${getPublicSurveyUrl(request.token)}`)}`}><MessageSquare className="mr-1.5 h-3.5 w-3.5" />Text</a></Button>
                          <Button asChild size="sm" variant="outline"><a href={`mailto:?subject=${encodeURIComponent("Rise Jar validation survey")}&body=${encodeURIComponent(`Please take this short survey to help validate Rise Jar:\n\n${getPublicSurveyUrl(request.token)}`)}`}><Mail className="mr-1.5 h-3.5 w-3.5" />Email</a></Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Use Share survey to open your phone’s contacts/share sheet, or send it by text or email. For community outreach, post the same link in groups where you already participate; InventSmith does not post or message people without an explicit connected-channel authorization.</p>
                        {surveyShareMessage && <p role="status" aria-live="polite" className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">{surveyShareMessage}</p>}
                      </div>
                    ) : surveyPreparationError ? <p role="alert" className="mt-2 text-xs text-destructive">{surveyPreparationError} <Link className="underline" href={`/invention/${inventionId}/evidence`}>Open Evidence Locker</Link></p> : evidenceRequests instanceof Error ? <p role="alert" className="mt-2 text-xs text-destructive">Survey links could not be loaded. <Link className="underline" href={`/invention/${inventionId}/evidence`}>Open Evidence Locker</Link></p> : <p className="mt-2 text-xs text-muted-foreground">Preparing your survey link…</p>;
                  })()}
                  <p className="mt-2 text-xs text-muted-foreground">Responses are saved as inventor-provided evidence and included in the next validation refresh. You decide where to share the link.</p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRebuildValidation}
                  disabled={isGenerating}
                  className="gap-1.5 text-sm w-fit"
                >
                  <RefreshCw className={`h-3.5 w-3.5${rebuilding ? " animate-spin" : ""}`} />
                  {isGenerating ? "Researching…" : failedSections.length > 0 ? "Retry failed sections" : "Refresh validation"}
                </Button>
                {rebuildError && (
                  <p className="text-xs text-destructive">{rebuildError}</p>
                )}
              </div>
            </div>

            {/* Plain-language summary: keep the next action visible and the report optional. */}
            {validationResearch && (
              <div className="mt-8 max-w-xl rounded-lg border border-border bg-muted/30 p-5 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">The short version</h2>
                <p className="text-sm leading-relaxed text-foreground">
                  {isGenerating
                    ? "Your research is still running. You do not need to review anything yet. Wait for it to finish, then check this summary."
                    : allSectionsError
                    ? "This attempt could not create the research. The full report contains the error details; the repeated section-by-section messages are optional."
                    : failedSections.length > 0
                    ? "Some sections are ready and some need another try. Your completed research is saved."
                    : "This is an early idea-check, not proof that customers will buy or that the market is confirmed. Some content may be AI-generated hypotheses."}
                </p>
                <div className="rounded-md border bg-background p-4">
                  <p className="text-sm font-semibold">What to do next</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {isGenerating
                      ? `Wait for the research to finish (${completedSections.length} of ${TOTAL_SECTIONS} sections processed so far).`
                      : allSectionsError || failedSections.length > 0
                      ? "If a retry is already running, wait for it to finish. Otherwise, after the AI connection is fixed, tap Retry failed sections."
                      : evidenceReview?.currentEvidenceMatchesRun === false
                      ? "This report does not match the latest evidence. Select Refresh validation to regenerate its sections and confidence using the current evidence."
                      : surveyEvidenceIncluded
                      ? "Your uploaded survey was included in this validation run. The next useful step is to add a few direct customer conversations or other evidence that addresses the remaining gaps."
                      : "Talk with a few people who use thick foods in jars. Ask what they do with the last portion, and save their real answers as evidence."}
                  </p>
                </div>
                {(surveyEvidenceIncluded || uploadedSurveys.length > 0 || (evidenceReview?.pendingSurveys?.length ?? 0) > 0) && !allSectionsError && failedSections.length === 0 && (
                  <div className="space-y-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                    <p className="font-medium text-primary">Survey evidence and refresh status</p>
                    {uploadedSurveys.length > 0 ? uploadedSurveys.map((survey, index) => (
                      <div key={`${survey.title}-${index}`} className="space-y-1 text-foreground">
                        <p className="font-medium">{survey.title}{survey.sampleSize ? ` · ${survey.sampleSize} reported` : ""}</p>
                        {survey.summary && <p className="text-muted-foreground">{survey.summary}</p>}
                        {survey.findings.length > 0 && <ul className="list-disc space-y-1 pl-5 text-muted-foreground">{survey.findings.map((finding, findingIndex) => <li key={findingIndex}>{finding}</li>)}</ul>}
                        <p className="text-xs text-muted-foreground">{survey.provenance}</p>
                      </div>
                    )) : <p className="text-muted-foreground">A survey was referenced in this report, but its extracted source details are not available in the current evidence record.</p>}
                    {evidenceReview?.pendingSurveys?.map((survey, index) => (
                      <p key={survey.title + "-pending-" + index} className={survey.status === "failed" ? "text-destructive" : "text-muted-foreground"}>
                        {survey.title}: {survey.status === "failed" ? "extraction needs retry" : "extraction is still processing; its results are not included yet"}.
                      </p>
                    ))}
                    <p className="text-xs text-muted-foreground">Survey results support customer-validation sections. They do not independently verify market size or prove demand. {evidenceReview?.currentEvidenceMatchesRun ? "This report matches the current evidence." : isGenerating ? "This report does not match current evidence; a refresh is currently running." : "This report does not match current evidence, and no refresh is running. Select Refresh validation to update it."}</p>
                    <p className="text-xs text-muted-foreground">The overall confidence is an evidence-support score, not the chance of success. A survey can strengthen relevant customer sections, but does not by itself verify demand, market size, or the product’s performance.</p>
                  </div>
                )}
                {!isGenerating && !allSectionsError && failedSections.length === 0 && evidenceReview?.currentEvidenceMatchesRun !== false && (
                  <p className="text-xs text-muted-foreground">Confidence: {avgConfidence}. Research date: {researchDateStr}.</p>
                )}
                {!isGenerating && evidenceReview?.currentEvidenceMatchesRun === false && (
                  <p className="text-xs font-medium text-amber-800">This completed report does not match the latest evidence. Confidence is hidden until a report that matches current evidence is complete.</p>
                )}
              </div>
            )}

            {/* ── Progress status bar ─────────────────────────────────────── */}
            {validationResearch && (
              <div className="mt-6 max-w-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {isGenerating ? (
                    <span className="font-medium text-foreground">
                      Generating validation research… {progressCount} of {TOTAL_SECTIONS} sections complete
                    </span>
                  ) : allSectionsError ? (
                    <span className="text-destructive font-medium">
                      Some sections need another try.
                    </span>
                  ) : (
                    <span className="text-primary font-medium">
                      {getValidationCompletionLabel(evidenceReview?.currentEvidenceMatchesRun, completedSections.length, TOTAL_SECTIONS)}
                    </span>
                  )}
                  {isGenerating && (
                    <span>{progressPct}%</span>
                  )}
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      allSectionsError
                        ? "bg-destructive"
                        : isGenerating
                        ? "bg-primary"
                        : "bg-primary"
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Keep the generated report available without making it the default reading experience. */}
            {completedSections.length > 0 && (
              <details className="mt-8 min-w-0 max-w-3xl rounded-lg border border-border bg-card p-4 sm:p-5">
                <summary className="cursor-pointer text-base font-semibold text-foreground">
                  View full research ({completedSections.length} sections)
                  <span className="mt-1 block text-sm font-normal text-muted-foreground">Optional details, assumptions, confidence, and evidence gaps</span>
                </summary>
                <div className="mt-5 min-w-0 space-y-4">
                {completedSections.map((section) => (
                  <div
                    key={section.sectionId ?? section.title ?? "validation-section"}
                    className="min-w-0 overflow-hidden rounded-lg border border-border bg-muted/20 p-4 sm:p-5 space-y-3"
                  >
                    <h3
                      className="text-base font-semibold text-foreground"
                      style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                    >
                      {section.title ?? section.sectionId ?? "Validation Section"}
                    </h3>

                    <p className="break-words text-sm text-foreground [overflow-wrap:anywhere] whitespace-pre-wrap leading-relaxed">
                      {section.status === "failed"
                        ? getSafeValidationFailureMessage(section.editedContent ?? section.content ?? "")
                        : section.editedContent ?? section.content ?? ""}
                    </p>

                    {section.confidence && (
                      <div className="space-y-2 pt-2 border-t border-border/60">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Confidence:</span>{" "}
                          {(section.confidence.level ?? "low").replace("_", " ")} ({Math.round((section.confidence.score ?? 0) * 100)}%)
                        </p>

                        {section.confidence.evidenceSummary && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Evidence:</span>{" "}
                            {section.confidence.evidenceSummary}
                          </p>
                        )}

                        {section.confidence.assumptions?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-foreground mb-1">Assumptions</p>
                            <ul className="list-disc list-inside space-y-0.5">
                              {section.confidence.assumptions.map((a: string, i: number) => (
                                <li key={i} className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">{a}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {section.status !== "failed" && section.confidence.missingInformation?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-foreground mb-1">Missing Information</p>
                            <ul className="list-disc list-inside space-y-0.5">
                              {section.confidence.missingInformation.map((m: string, i: number) => (
                                <li key={i} className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                </div>
              </details>
            )}

            <div className="mt-12 pt-8 border-t border-border">
              <JourneyMap currentStageId={stageId} inventionId={inventionId} />
            </div>
          </div>
        </main>
        <footer className="border-t border-border">
          <MadeThisBadge />
        </footer>
      </div>
    );
  }

  // Show congratulations after completing the foundation stages.
  if (showCongrats) {
    return <CongratulatoryScreen inventionTitle={invention.title} inventionId={String(inventionId)} />;
  }

  // Later stages use the full journey center and department workspaces.
  if (!currentStage.enabled || stageId > 4) {
    return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-3xl px-4 py-12 text-sm text-muted-foreground">Opening your next department…</main></div>;
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleBlur = async (field: FieldDef) => {
    const value = fieldValues[field.key] ?? "";
    try {
      if (stageId === 1) {
        // Stage 1: update invention record directly
        if (
          field.key === "title" ||
          field.key === "problemStatement" ||
          field.key === "targetAudience" ||
          field.key === "solutionDescription"
        ) {
          await updateInventionField({
            inventionId,
            field: field.key as "title" | "problemStatement" | "targetAudience" | "solutionDescription",
            value,
          });
        }
      } else {
        await updateStageProgress({ inventionId, stageId, field: field.key, value });
      }
    } catch {
      // silently handle; next save will retry
    }
  };

  const handleAdvance = async () => {
    setAdvancing(true);
    try {
      trackContinueClicked(stageId, currentStage.name, inventionId);
      if (readinessState === "Ready to Move Forward") {
        trackStageCompleted(stageId, currentStage.name, inventionId);
        const nextStageId = await advanceStage({ inventionId });
        // null means no next enabled stage — we're done with all active stages
        if (nextStageId === null) {
          setShowCongrats(true);
          return;
        }
      }
      router.push("/dashboard");
    } catch {
      setAdvancing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          {/* Back link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
            {/* ── Left panel: status ──────────────────────────────────────── */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium uppercase tracking-widest text-primary">
                    Stage {stageId}
                  </p>
                  <InventionCardMenu
                    inventionId={inventionId}
                    inventionTitle={invention.title}
                    onDeleted={() => router.push("/onboarding")}
                  />
                </div>
                <h1
                  className="text-2xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                >
                  {currentStage.name}
                </h1>
              </div>

              <ReadinessBadge state={readinessState} />

              <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-primary/30 pl-3">
                {nextAction}
              </p>

              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  {completedFields.length} of{" "}
                  {currentStage.completionCriteria?.length ?? 0} fields complete
                </p>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        currentStage.completionCriteria?.length
                          ? (completedFields.length / currentStage.completionCriteria.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {readinessState === "Ready to Move Forward" ? (
                <Button
                  className="w-full gap-2"
                  onClick={handleAdvance}
                  disabled={advancing}
                >
                  {advancing ? "Moving forward…" : "Continue →"}
                  {!advancing && <ArrowRight className="h-4 w-4" />}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleAdvance}
                  disabled={advancing}
                >
                  Save & Dashboard
                </Button>
              )}
            </div>

            {/* ── Right panel: fields ─────────────────────────────────────── */}
            <div className="space-y-6">
              <h2
                className="text-lg font-semibold text-foreground"
                style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
              >
                {invention.title}
              </h2>

              {fields?.map((field) => {
                const isDone = completedFields.includes(field.key);
                return (
                  <div key={field.key} className="space-y-2">
                    <Label
                      htmlFor={field.key}
                      className={isDone ? "text-foreground" : "text-muted-foreground"}
                    >
                      {field.label}
                      {isDone && (
                        <span className="ml-2 text-primary text-xs font-normal">✓ saved</span>
                      )}
                    </Label>
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.key}
                        value={fieldValues[field.key] ?? ""}
                        onChange={(e) =>
                          setFieldValues((v) => ({ ...v, [field.key]: e.target.value }))
                        }
                        onBlur={() => handleBlur(field)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="resize-none"
                        // Stage 1 fields are editable (inline edit)
                        readOnly={stageId === 1 && !["problemStatement", "targetAudience", "solutionDescription", "title"].includes(field.key)}
                      />
                    ) : (
                      <Input
                        id={field.key}
                        value={fieldValues[field.key] ?? ""}
                        onChange={(e) =>
                          setFieldValues((v) => ({ ...v, [field.key]: e.target.value }))
                        }
                        onBlur={() => handleBlur(field)}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                );
              })}

              <p className="text-xs text-muted-foreground">
                Fields save automatically when you move to the next one.
              </p>
            </div>
          </div>

          {/* Journey map */}
          <div className="mt-12 pt-8 border-t border-border">
            <JourneyMap currentStageId={stageId} inventionId={inventionId} />
          </div>
        </div>
      </main>

      <footer className="border-t border-border">
        <MadeThisBadge />
      </footer>
    </div>
  );
}
