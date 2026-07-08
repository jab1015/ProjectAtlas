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
import { ArrowLeft, ArrowRight, Lock, PartyPopper, RefreshCw } from "lucide-react";
import Link from "next/link";
import { trackStageCompleted, trackContinueClicked, trackUpgradePromptShown } from "@/lib/analytics";
import { InventionCardMenu } from "@/components/atlas/invention-card-menu";

// ── Congratulations screen (Stage 4 completion) ──────────────────────────────

function CongratulatoryScreen({ inventionTitle }: { inventionTitle: string }) {
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
              Stage 4 Complete
            </p>
            <h1
              className="text-3xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
            >
              {inventionTitle} is patent-ready.
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              You&rsquo;ve completed all four foundation stages — idea capture,
              validation, market research, and patent readiness. This is a real
              milestone.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-5 text-left space-y-2">
            <p className="text-sm font-medium text-foreground">Coming soon: Pro</p>
            <p className="text-sm text-muted-foreground">
              Stages 5–15 — product design, IP protection, manufacturing,
              funding, and launch — are on the way. Upgrade when ready.
            </p>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard">Back to Dashboard</Link>
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

// ── Upgrade screen for stages 5+ ────────────────────────────────────────────

function ComingSoonStage({ stageId, stageName }: { stageId: number; stageName: string }) {
  useEffect(() => {
    trackUpgradePromptShown(`stage_${stageId}`);
  }, [stageId]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              <Lock className="h-7 w-7 text-muted-foreground" />
            </div>
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-foreground mb-2"
              style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
            >
              Stage {stageId}: {stageName}
            </h1>
            <p className="text-muted-foreground">
              This stage is part of the Pro journey — coming soon.
              Complete Stages 1–4 to reach patent readiness.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <div>
            <Link href="/pricing" className="text-sm text-primary hover:underline underline-offset-4">
              Learn about Pro →
            </Link>
          </div>
        </div>
      </main>
      <footer className="border-t border-border">
        <MadeThisBadge />
      </footer>
    </div>
  );
}

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

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [advancing, setAdvancing] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildError, setRebuildError] = useState<string | null>(null);
  const rebuildTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

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
      await forceRegenerateValidation({ inventionId });
      // Keep rebuilding=true — the reactive query will update as sections come in
    } catch (err) {
      console.error("Rebuild failed:", err);
      const msg = err instanceof Error ? err.message : "Rebuild failed. Please try again.";
      setRebuildError(msg);
      setRebuilding(false);
      if (rebuildTimeoutRef.current) clearTimeout(rebuildTimeoutRef.current);
    }
  }, [forceRegenerateValidation, inventionId]);

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

  if (isLoading || !isAuthenticated || inventionState === undefined) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
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
    // Sections that have been generated (not still pending)
    const completedSections = sectionsList.filter(
      (s) => s.status !== "pending"
    );

    // Progress bar state
    const isGenerating =
      rebuilding ||
      validationResearch?.status === "running" ||
      (validationResearch && completedSections.length < TOTAL_SECTIONS);
    const progressCount = completedSections.length;
    const progressPct = Math.round((progressCount / TOTAL_SECTIONS) * 100);

    // Determine if all sections are errors
    const allSectionsError =
      completedSections.length === TOTAL_SECTIONS &&
      completedSections.every((s: { content: string }) =>
        s.content?.includes("OPENAI_API_KEY") ||
        s.content?.includes("Unable to generate") ||
        s.content?.includes("Error:")
      );

    let statusLabel = "Waiting to begin";
    if (isGenerating) {
      statusLabel = "Research in progress";
    } else if (validationResearch?.status === "complete" || completedSections.length === TOTAL_SECTIONS) {
      statusLabel = allSectionsError ? "Validation failed" : "Validation complete";
    }

    // Summary stats
    const sectionsWithConf = completedSections.filter(
      (s: { confidence?: { score: number } }) =>
        typeof (s as { confidence?: { score: number } }).confidence?.score === "number"
    );
    const avgConfidence =
      sectionsWithConf.length > 0
        ? `${Math.round(
            (sectionsWithConf.reduce(
              (sum: number, s: { confidence?: { score: number } }) =>
                sum + ((s.confidence?.score ?? 0)),
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
      <div className="min-h-screen flex flex-col bg-background">
        <AppNav />
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
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
                Atlas is validating your invention.
              </h1>
              <p className="text-muted-foreground">
                {isGenerating
                  ? "Research is running. Sections will appear as they complete."
                  : "Research has completed. Click Rebuild to regenerate with updated information."}
              </p>
              <p className="text-sm text-foreground">
                Status: <span className="font-medium">{statusLabel}</span>
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRebuildValidation}
                  disabled={rebuilding}
                  className="gap-1.5 text-sm w-fit"
                >
                  <RefreshCw className={`h-3.5 w-3.5${rebuilding ? " animate-spin" : ""}`} />
                  {rebuilding ? "Rebuilding…" : "Rebuild Validation"}
                </Button>
                {rebuildError && (
                  <p className="text-xs text-destructive">{rebuildError}</p>
                )}
              </div>
            </div>

            {/* Validation Summary card — appears only when research data exists */}
            {validationResearch && (
              <div className="mt-8 rounded-lg border border-border bg-muted/30 p-5 space-y-4 max-w-xl">
                <h2
                  className="text-base font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                >
                  Validation Summary
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isGenerating
                    ? "Atlas is researching your invention. New sections will appear automatically."
                    : allSectionsError
                    ? "Validation encountered errors. Click Rebuild to try again."
                    : "Atlas has completed the first round of validation research for your invention."}
                </p>
                <dl className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Research Status</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">{statusLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Overall Confidence</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">{avgConfidence}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Sections Completed</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {completedSections.length} of {TOTAL_SECTIONS}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Research Date</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">{researchDateStr}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Provider</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">Atlas Research Engine</dd>
                  </div>
                </dl>
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
                      {TOTAL_SECTIONS} of {TOTAL_SECTIONS} sections — validation failed. Click Rebuild to regenerate.
                    </span>
                  ) : (
                    <span className="text-primary font-medium">
                      Validation complete — {TOTAL_SECTIONS} of {TOTAL_SECTIONS} sections
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

            {/* Research section cards */}
            {completedSections.length > 0 && (
              <div className="mt-10 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2
                    className="text-lg font-semibold text-foreground"
                    style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                  >
                    Validation Research
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRebuildValidation}
                    disabled={rebuilding}
                    className="gap-1.5 text-sm"
                  >
                    <RefreshCw className={`h-3.5 w-3.5${rebuilding ? " animate-spin" : ""}`} />
                    {rebuilding ? "Rebuilding…" : "Rebuild Validation"}
                  </Button>
                </div>
                {completedSections.map((section: {
                  sectionId: string;
                  title: string;
                  content: string;
                  editedContent?: string;
                  confidence?: {
                    score: number;
                    level: string;
                    evidenceSummary: string;
                    assumptions: string[];
                    missingInformation: string[];
                  };
                }) => (
                  <div
                    key={section.sectionId}
                    className="rounded-lg border border-border bg-muted/20 p-5 space-y-3"
                  >
                    <h3
                      className="text-base font-semibold text-foreground"
                      style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                    >
                      {section.title}
                    </h3>

                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {section.editedContent ?? section.content}
                    </p>

                    {section.confidence && (
                      <div className="space-y-2 pt-2 border-t border-border/60">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Confidence:</span>{" "}
                          {section.confidence.level.replace("_", " ")} ({Math.round(section.confidence.score * 100)}%)
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
                                <li key={i} className="text-xs text-muted-foreground">{a}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {section.confidence.missingInformation?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-foreground mb-1">Missing Information</p>
                            <ul className="list-disc list-inside space-y-0.5">
                              {section.confidence.missingInformation.map((m: string, i: number) => (
                                <li key={i} className="text-xs text-muted-foreground">{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
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

  // Show congratulations after completing all enabled stages
  if (showCongrats) {
    return <CongratulatoryScreen inventionTitle={invention.title} />;
  }

  // Stages 5+: show coming soon
  if (!currentStage.enabled || stageId > 4) {
    return <ComingSoonStage stageId={stageId} stageName={currentStage.name} />;
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
