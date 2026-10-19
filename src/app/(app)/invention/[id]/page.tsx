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
import { getSafeValidationFailureMessage, getValidationResearchViewState } from "@/lib/validationResearchView";

// â”€â”€ Congratulations screen (Stage 4 completion) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
              You&rsquo;ve completed all four foundation stages â€” idea capture,
              validation, market research, and patent readiness. This is a real
              milestone.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-5 text-left space-y-2">
            <p className="text-sm font-medium text-foreground">Coming soon: Pro</p>
            <p className="text-sm text-muted-foreground">
              Stages 5â€“15 â€” product design, IP protection, manufacturing,
              funding, and launch â€” are on the way. Upgrade when ready.
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

// â”€â”€ Field definitions per stage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea";
}

const STAGE_FIELDS: Record<number, FieldDef[]> = {
  1: [
    { key: "problemStatement", label: "What problem does your invention solve?", placeholder: "Describe the problemâ€¦", type: "textarea" },
    { key: "targetAudience", label: "Who experiences this problem most?", placeholder: "Describe your target audienceâ€¦", type: "textarea" },
    { key: "solutionDescription", label: "How does your invention solve it?", placeholder: "Describe your solutionâ€¦", type: "textarea" },
    { key: "title", label: "Working title", placeholder: "Invention titleâ€¦", type: "text" },
  ],
  2: [
    { key: "validationMethod", label: "What method will you use to validate demand?", placeholder: "e.g. customer interviews, landing page test, pre-ordersâ€¦", type: "text" },
    { key: "targetMarketSize", label: "Estimate your target market size.", placeholder: "e.g. 50M people in the US spend $2B/yr onâ€¦", type: "text" },
    { key: "competitorAnalysis", label: "Who are your top 3 competitors or alternatives?", placeholder: "List them and what they get right/wrongâ€¦", type: "text" },
  ],
  3: [
    { key: "marketSegment", label: "Which market segment is your primary target?", placeholder: "e.g. small business owners in manufacturingâ€¦", type: "text" },
    { key: "customerPersona", label: "Describe your ideal customer.", placeholder: "Age, role, pain points, buying behaviorâ€¦", type: "text" },
    { key: "pricePoint", label: "What price would your customer pay?", placeholder: "e.g. $49 one-time / $19/mo / $500 enterpriseâ€¦", type: "text" },
  ],
  4: [
    { key: "priorArtSearch", label: "Have you searched for prior art? Summarize what you found.", placeholder: "e.g. Searched USPTO, Google Patents. Found 3 similar patents from 2015, but none coverâ€¦", type: "textarea" },
    { key: "patentabilityAssessment", label: "Do you believe your invention is novel and non-obvious? Why?", placeholder: "Explain what makes your invention different from existing patentsâ€¦", type: "textarea" },
    { key: "inventionDisclosure", label: "Write a brief invention disclosure statement.", placeholder: "A clear description of the invention, the problem it solves, and how it works â€” enough for a patent attorney to evaluateâ€¦", type: "textarea" },
  ],
};

// â”€â”€ Upgrade screen for stages 5+ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
              This stage is part of the Pro journey â€” coming soon.
              Complete Stages 1â€“4 to reach patent readiness.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <div>
            <Link href="/pricing" className="text-sm text-primary hover:underline underline-offset-4">
              Learn about Pro â†’
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

// â”€â”€ Stage 1 field values come from the invention record itself â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Main workspace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
      // For other stages, we don't have the values directly â€” just which fields are complete
      // The user will fill them in as text inputs
      const initial: Record<string, string> = {};
      completedFields.forEach((f) => (initial[f] = "âœ“")); // mark as done
      setFieldValues(initial);
    }
  }, [inventionState]);

  // â”€â”€ Stage 2: Rebuild Validation handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      // Keep rebuilding=true â€” the reactive query will update as sections come in
    } catch (err) {
      console.error("Rebuild failed:", err);
      const msg = err instanceof Error ? err.message : "Rebuild failed. Please try again.";
      setRebuildError(msg);
      setRebuilding(false);
      if (rebuildTimeoutRef.current) clearTimeout(rebuildTimeoutRef.current);
    }
  }, [forceRegenerateValidation, inventionId, retryFailedValidation]);

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
      <div className="min-h-screen min-w-0 flex flex-col bg-background">
        <AppNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loadingâ€¦</div>
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

  // â”€â”€ Stage 2: Validation Research Status (replaces questionnaire) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    const evidenceReview = (validationResearch as { evidenceReview?: { currentEvidenceMatchesRun: boolean; surveys: Array<{ title: string; sampleSize?: string; summary: string; findings: string[]; provenance: string }>; pendingSurveys: Array<{ title: string; status: "processing" | "failed" }> } } | null)?.evidenceReview;
    const uploadedSurveys = evidenceReview?.surveys ?? [];
    const pendingSurveys = evidenceReview?.pendingSurveys ?? [];
    const reportMatchesCurrentEvidence = evidenceReview?.currentEvidenceMatchesRun === true;
    const avgConfidencnùÒÚ$z{-®éÜj×µÕÑ•µ™½É•É½Õ¹ˆùQ¡”½Ù•É…±°½¹™¥‘•¹”¥Ì…¸•Ù¥‘•¹”µÍÕÁÁ½ÉÐÍ½É”°¹½ÐÑ¡”¡…¹”½˜ÍÕ•ÍÌ¸ÍÕÉÙ•ä…¸ÍÑÉ•¹Ñ¡•¸É•±•Ù…¹ÐÕÍÑ½µ•ÈÍ•Ñ¥½¹Ì°‰ÕÐ‘½•Ì¹½Ð‰ä¥ÑÍ•±˜Ù•É¥™ä‘•µ…¹°µ…É­•ÐÍ¥é”°½ÈÑ¡”ÁÉ½‘ÕÓŠeÌÁ•É™½Éµ…¹”¸ð½Àø(€€€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€ì…¥Í•¹•É…Ñ¥¹œ€˜˜€……±±M•Ñ¥½¹ÍÉÉ½È€˜˜™…¥±•‘M•Ñ¥½¹Ì¹±•¹Ñ €ôôô€À€˜˜É•Á½ÉÑ5…Ñ¡•ÍÕÉÉ•¹ÑÙ¥‘•¹”€˜˜€ (€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµáÌÑ•áÐµµÕÑ•µ™½É•É½Õ¹ˆù½¹™¥‘•¹”èí…Ù½¹™¥‘•¹•ô¸I•Í•…É ‘…Ñ”èíÉ•Í•…É¡…Ñ•MÑÉô¸ð½Àø(€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€ì…¥Í•¹•É…Ñ¥¹œ€˜˜€……±±M•Ñ¥½¹ÍÉÉ½È€˜˜™…¥±•‘M•Ñ¥½¹Ì¹±•¹Ñ €ôôô€À€˜˜€…É•Á½ÉÑ5…Ñ¡•ÍÕÉÉ•¹ÑÙ¥‘•¹”€˜˜€ (€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµáÌ™½¹Ðµµ•‘¥Õ´Ñ•áÐµ…µ‰•È´ÜÀÀˆùUÁ‘…Ñ¥¹œ½¹™¥‘•¹”™É½´ÕÉÉ•¹Ð•Ù¥‘•¹”¸Q¡”ÁÉ•Ù¥½ÕÌÍ½É”¥Ì½ÕÐ½˜‘…Ñ”¸ð½Àø(€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€¥ô((€€€€€€€€€€€ì¼¨ƒŠRŠR AÉ½É•ÍÌÍÑ…ÑÕÌ‰…ÈƒŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠR €¨½ô(€€€€€€€€€€€íÙ…±¥‘…Ñ¥½¹I•Í•…É €˜˜€ (€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µÐ´Øµ…àµÜµá°ÍÁ…”µä´Èˆø(€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰™±•à¥Ñ•µÌµ•¹Ñ•È©ÕÍÑ¥™äµ‰•ÑÝ••¸Ñ•áÐµáÌÑ•áÐµµÕÑ•µ™½É•É½Õ¹ˆø(€€€€€€€€€€€€€€€€€í¥Í•¹•É…Ñ¥¹œ€ü€ (€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰™½¹Ðµµ•‘¥Õ´Ñ•áÐµ™½É•É½Õ¹ˆø(€€€€€€€€€€€€€€€€€€€€€•¹•É…Ñ¥¹œÙ…±¥‘…Ñ¥½¸É•Í•…É£Š˜íÁÉ½É•ÍÍ½Õ¹Ñô½˜íQ=Q1}MQ%=9MôÍ•Ñ¥½¹Ì½µÁ±•Ñ”(€€€€€€€€€€€€€€€€€€€€ð½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€¤€è…±±M•Ñ¥½¹ÍÉÉ½È€ü€ (€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰Ñ•áÐµ‘•ÍÑÉÕÑ¥Ù”™½¹Ðµµ•‘¥Õ´ˆø(€€€€€€€€€€€€€€€€€€€€€M½µ”Í•Ñ¥½¹Ì¹••…¹½Ñ¡•ÈÑÉä¸(€€€€€€€€€€€€€€€€€€€€ð½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€¤€è€ (€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰Ñ•áÐµÁÉ¥µ…Éä™½¹Ðµµ•‘¥Õ´ˆø(€€€€€€€€€€€€€€€€€€€€€Y…±¥‘…Ñ¥½¸½µÁ±•Ñ”ƒŠPí½µÁ±•Ñ•‘M•Ñ¥½¹Ì¹±•¹Ñ¡ô½˜íQ=Q1}MQ%=9MôÍ•Ñ¥½¹Ì(€€€€€€€€€€€€€€€€€€€€ð½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€í¥Í•¹•É…Ñ¥¹œ€˜˜€ (€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸ùíÁÉ½É•ÍÍAÑô”ð½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Üµ™Õ±° ´ÈÉ½Õ¹‘•µ™Õ±°‰œµµÕÑ•½Ù•É™±½Üµ¡¥‘‘•¸ˆø(€€€€€€€€€€€€€€€€€€ñ‘¥Ø(€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”õí ´ÈÉ½Õ¹‘•µ™Õ±°ÑÉ…¹Í¥Ñ¥½¸µ…±°‘ÕÉ…Ñ¥½¸´ÌÀÀ€‘ì(€€€€€€€€€€€€€€€€€€€€€…±±M•Ñ¥½¹ÍÉÉ½È(€€€€€€€€€€€€€€€€€€€€€€€€ü€‰‰œµ‘•ÍÑÉÕÑ¥Ù”ˆ(€€€€€€€€€€€€€€€€€€€€€€€€è¥Í•¹•É…Ñ¥¹œ(€€€€€€€€€€€€€€€€€€€€€€€€ü€‰‰œµÁÉ¥µ…Éäˆ(€€€€€€€€€€€€€€€€€€€€€€€€è€‰‰œµÁÉ¥µ…Éäˆ(€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€ÍÑå±”õíìÝ¥‘Ñ è€‘íÁÉ½É•ÍÍAÑô•€õô(€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€¥ô((€€€€€€€€€€€ì¼¨-••ÀÑ¡”•¹•É…Ñ•É•Á½ÉÐ…Ù…¥±…‰±”Ý¥Ñ¡½ÕÐµ…­¥¹œ¥ÐÑ¡”‘•™…Õ±ÐÉ•…‘¥¹œ•áÁ•É¥•¹”¸€¨½ô(€€€€€€€€€€€í½µÁ±•Ñ•‘M•Ñ¥½¹Ì¹±•¹Ñ €ø€À€˜˜€ (€€€€€€€€€€€€€€ñ‘•Ñ…¥±Ì±…ÍÍ9…µ”ô‰µÐ´àµ¥¸µÜ´Àµ…àµÜ´Íá°É½Õ¹‘•µ±œ‰½É‘•È‰½É‘•Èµ‰½É‘•È‰œµ…ÉÀ´ÐÍ´éÀ´Ôˆø(€€€€€€€€€€€€€€€€ñÍÕµµ…Éä±…ÍÍ9…µ”ô‰ÕÉÍ½ÈµÁ½¥¹Ñ•ÈÑ•áÐµ‰…Í”™½¹ÐµÍ•µ¥‰½±Ñ•áÐµ™½É•É½Õ¹ˆø(€€€€€€€€€€€€€€€€€Y¥•Ü™Õ±°É•Í•…É €¡í½µÁ±•Ñ•‘M•Ñ¥½¹Ì¹±•¹Ñ¡ôÍ•Ñ¥½¹Ì¤(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰µÐ´Ä‰±½¬Ñ•áÐµÍ´™½¹Ðµ¹½Éµ…°Ñ•áÐµµÕÑ•µ™½É•É½Õ¹ˆù=ÁÑ¥½¹…°‘•Ñ…¥±Ì°…ÍÍÕµÁÑ¥½¹Ì°½¹™¥‘•¹”°…¹•Ù¥‘•¹”…ÁÌð½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ð½ÍÕµµ…Éäø(€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µÐ´Ôµ¥¸µÜ´ÀÍÁ…”µä´Ðˆø(€€€€€€€€€€€€€€€í½µÁ±•Ñ•‘M•Ñ¥½¹Ì¹µ…À ¡Í•Ñ¥½¸¤€ôø€ (€€€€€€€€€€€€€€€€€€ñ‘¥Ø(€€€€€€€€€€€€€€€€€€€­•äõíÍ•Ñ¥½¸¹Í•Ñ¥½¹%€üüÍ•Ñ¥½¸¹Ñ¥Ñ±”€üü€‰Ù…±¥‘…Ñ¥½¸µÍ•Ñ¥½¸‰ô(€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰µ¥¸µÜ´À½Ù•É™±½Üµ¡¥‘‘•¸É½Õ¹‘•µ±œ‰½É‘•È‰½É‘•Èµ‰½É‘•È‰œµµÕÑ•¼ÈÀÀ´ÐÍ´éÀ´ÔÍÁ…”µä´Ìˆ(€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€ñ Ì(€€€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰Ñ•áÐµ‰…Í”™½¹ÐµÍ•µ¥‰½±Ñ•áÐµ™½É•É½Õ¹ˆ(€€€€€€€€€€€€€€€€€€€€€ÍÑå±”õíì™½¹Ñ…µ¥±äè€‰Ù…È ´µ™½¹Ðµ¡•…‘¥¹œ¤°Õ¤µÍ…¹ÌµÍ•É¥˜°ÍåÍÑ•´µÕ¤°Í…¹ÌµÍ•É¥˜ˆõô(€€€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€€íÍ•Ñ¥½¸¹Ñ¥Ñ±”€üüÍ•Ñ¥½¸¹Í•Ñ¥½¹%€üü€‰Y…±¥‘…Ñ¥½¸M•Ñ¥½¸‰ô(€€€€€€€€€€€€€€€€€€€€ð½ Ìø((€€€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‰É•…¬µÝ½É‘ÌÑ•áÐµÍ´Ñ•áÐµ™½É•É½Õ¹m½Ù•É™±½ÜµÝÉ…Àé…¹åÝ¡•É•tÝ¡¥Ñ•ÍÁ…”µÁÉ”µÝÉ…À±•…‘¥¹œµÉ•±…á•ˆø(€€€€€€€€€€€€€€€€€€€€€íÍ•Ñ¥½¸¹ÍÑ…ÑÕÌ€ôôô€‰™…¥±•ˆ(€€€€€€€€€€€€€€€€€€€€€€€€ü•ÑM…™•Y…±¥‘…Ñ¥½¹…¥±ÕÉ•5•ÍÍ…”¡Í•Ñ¥½¸¹•‘¥Ñ•‘½¹Ñ•¹Ð€üüÍ•Ñ¥½¸¹½¹Ñ•¹Ð€üü€ˆˆ¤(€€€€€€€€€€€€€€€€€€€€€€€€èÍ•Ñ¥½¸¹•‘¥Ñ•‘½¹Ñ•¹Ð€üüÍ•Ñ¥½¸¹½¹Ñ•¹Ð€üü€ˆ‰ô(€€€€€€€€€€€€€€€€€€€€ð½Àø((€€€€€€€€€€€€€€€€€€€íÍ•Ñ¥½¸¹½¹™¥‘•¹”€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰ÍÁ…”µä´ÈÁÐ´È‰½É‘•ÈµÐ‰½É‘•Èµ‰½É‘•È¼ØÀˆø(€€€€€€€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµáÌÑ•áÐµµÕÑ•µ™½É•É½Õ¹ˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰™½¹Ðµµ•‘¥Õ´Ñ•áÐµ™½É•É½Õ¹ˆù½¹™¥‘•¹”èð½ÍÁ…¸ùìˆ€‰ô(€€€€€€€€€€€€€€€€€€€€€€€€€ì¡Í•Ñ¥½¸¹½¹™¥‘•¹”¹±•Ù•°€üü€‰±½Üˆ¤¹É•Á±…” ‰|ˆ°€ˆ€ˆ¥ô€¡í5…Ñ ¹É½Õ¹ ¡Í•Ñ¥½¸¹½¹™¥‘•¹”¹Í½É”€üü€À¤€¨€ÄÀÀ¥ô”¤(€€€€€€€€€€€€€€€€€€€€€€€€ð½Àø((€€€€€€€€€€€€€€€€€€€€€€€íÍ•Ñ¥½¸¹½¹™¥‘•¹”¹•Ù¥‘•¹•MÕµµ…Éä€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµáÌÑ•áÐµµÕÑ•µ™½É•É½Õ¹ˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰™½¹Ðµµ•‘¥Õ´Ñ•áÐµ™½É•É½Õ¹ˆùÙ¥‘•¹”èð½ÍÁ…¸ùìˆ€‰ô(€€€€€€€€€€€€€€€€€€€€€€€€€€€íÍ•Ñ¥½¸¹½¹™¥‘•¹”¹•Ù¥‘•¹•MÕµµ…Éåô(€€€€€€€€€€€€€€€€€€€€€€€€€€ð½Àø(€€€€€€€€€€€€€€€€€€€€€€€€¥ô((€€€€€€€€€€€€€€€€€€€€€€€íÍ•Ñ¥½¸¹½¹™¥‘•¹”¹…ÍÍÕµÁÑ¥½¹Ìü¹±•¹Ñ €ø€À€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµáÌ™½¹Ðµµ•‘¥Õ´Ñ•áÐµ™½É•É½Õ¹µˆ´ÄˆùÍÍÕµÁÑ¥½¹Ìð½Àø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñÕ°±…ÍÍ9…µ”ô‰±¥ÍÐµ‘¥ÍŒ±¥ÍÐµ¥¹Í¥‘”ÍÁ…”µä´À¸Ôˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€íÍ•Ñ¥½¸¹½¹™¥‘•¹”¹…ÍÍÕµÁÑ¥½¹Ì¹µ…À ¡„èÍÑÉ¥¹œ°¤è¹Õµ‰•È¤€ôø€ (€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ±¤­•äõí¥ô±…ÍÍ9…µ”ô‰‰É•…¬µÝ½É‘ÌÑ•áÐµáÌÑ•áÐµµÕÑ•µ™½É•É½Õ¹m½Ù•É™±½ÜµÝÉ…Àé…¹åÝ¡•É•tˆùí…ôð½±¤ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ð½Õ°ø(€€€€€€€€€€€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€€€€€€€€€€€¥ô((€€€€€€€€€€€€€€€€€€€€€€€íÍ•Ñ¥½¸¹ÍÑ…ÑÕÌ€„ôô€‰™…¥±•ˆ€˜˜Í•Ñ¥½¸¹½¹™¥‘•¹”¹µ¥ÍÍ¥¹%¹™½Éµ…Ñ¥½¸ü¹±•¹Ñ €ø€À€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµáÌ™½¹Ðµµ•‘¥Õ´Ñ•áÐµ™½É•É½Õ¹µˆ´Äˆù5¥ÍÍ¥¹œ%¹™½Éµ…Ñ¥½¸ð½Àø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñÕ°±…ÍÍ9…µ”ô‰±¥ÍÐµ‘¥ÍŒ±¥ÍÐµ¥¹Í¥‘”ÍÁ…”µä´À¸Ôˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€íÍ•Ñ¥½¸¹½¹™¥‘•¹”¹µ¥ÍÍ¥¹%¹™½Éµ…Ñ¥½¸¹µ…À ¡´èÍÑÉ¥¹œ°¤è¹Õµ‰•È¤€ôø€ (€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ±¤­•äõí¥ô±…ÍÍ9…µ”ô‰‰É•…¬µÝ½É‘ÌÑ•áÐµáÌÑ•áÐµµÕÑ•µ™½É•É½Õ¹m½Ù•É™±½ÜµÝÉ…Àé…¹åÝ¡•É•tˆùíµôð½±¤ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ð½Õ°ø(€€€€€€€€€€€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€ð½‘•Ñ…¥±Ìø(€€€€€€€€€€€€¥ô((€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µÐ´ÄÈÁÐ´à‰½É‘•ÈµÐ‰½É‘•Èµ‰½É‘•Èˆø(€€€€€€€€€€€€€€ñ)½ÕÉ¹•å5…ÀÕÉÉ•¹ÑMÑ…•%õíÍÑ…•%‘ô¥¹Ù•¹Ñ¥½¹%õí¥¹Ù•¹Ñ¥½¹%‘ô€¼ø(€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€ð½‘¥Øø(€€€€€€€€ð½µ…¥¸ø(€€€€€€€€ñ™½½Ñ•È±…ÍÍ9…µ”ô‰‰½É‘•ÈµÐ‰½É‘•Èµ‰½É‘•Èˆø(€€€€€€€€€€ñ5…‘•Q¡¥Í	…‘”€¼ø(€€€€€€€€ð½™½½Ñ•Èø(€€€€€€ð½‘¥Øø(€€€€¤ì(€ô((€€¼¼M¡½Ü½¹É…ÑÕ±…Ñ¥½¹Ì…™Ñ•È½µÁ±•Ñ¥¹œ…±°•¹…‰±•ÍÑ…•Ì(€¥˜€¡Í¡½Ý½¹É…ÑÌ¤ì(€€€É•ÑÕÉ¸€ñ½¹É…ÑÕ±…Ñ½ÉåMÉ••¸¥¹Ù•¹Ñ¥½¹Q¥Ñ±”õí¥¹Ù•¹Ñ¥½¸¹Ñ¥Ñ±•ô€¼øì(€ô((€€¼¼MÑ…•Ì€Ô¬èÍ¡½Ü½µ¥¹œÍ½½¸(€¥˜€ …ÕÉÉ•¹ÑMÑ…”¹•¹…‰±•ñðÍÑ…•%€ø€Ð¤ì(€€€É•ÑÕÉ¸€ñ½µ¥¹M½½¹MÑ…”ÍÑ…•%õíÍÑ…•%‘ôÍÑ…•9…µ”õíÕÉÉ•¹ÑMÑ…”¹¹…µ•ô€¼øì(€ô((€€¼¼ƒŠRŠR !…¹‘±•ÉÌƒŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠR ((€½¹ÍÐ¡…¹‘±•	±ÕÈ€ô…Íå¹Œ€¡™¥•±è¥•±‘•˜¤€ôøì(€€€½¹ÍÐÙ…±Õ”€ô™¥•±‘Y…±Õ•Ím™¥•±¹­•åt€üü€ˆˆì(€€€ÑÉäì(€€€€€¥˜€¡ÍÑ…•%€ôôô€Ä¤ì(€€€€€€€€¼¼MÑ…”€ÄèÕÁ‘…Ñ”¥¹Ù•¹Ñ¥½¸É•½É‘¥É•Ñ±ä(€€€€€€€¥˜€ (€€€€€€€€€™¥•±¹­•ä€ôôô€‰Ñ¥Ñ±”ˆñð(€€€€€€€€€™¥•±¹­•ä€ôôô€‰ÁÉ½‰±•µMÑ…Ñ•µ•¹Ðˆñð(€€€€€€€€€™¥•±¹­•ä€ôôô€‰Ñ…É•ÑÕ‘¥•¹”ˆñð(€€€€€€€€€™¥•±¹­•ä€ôôô€‰Í½±ÕÑ¥½¹•ÍÉ¥ÁÑ¥½¸ˆ(€€€€€€€€¤ì(€€€€€€€€€…Ý…¥ÐÕÁ‘…Ñ•%¹Ù•¹Ñ¥½¹¥•±¡ì(€€€€€€€€€€€¥¹Ù•¹Ñ¥½¹%°(€€€€€€€€€€€™¥•±è™¥•±¹­•ä…Ì€‰Ñ¥Ñ±”ˆð€‰ÁÉ½‰±•µMÑ…Ñ•µ•¹Ðˆð€‰Ñ…É•ÑÕ‘¥•¹”ˆð€‰Í½±ÕÑ¥½¹•ÍÉ¥ÁÑ¥½¸ˆ°(€€€€€€€€€€€Ù…±Õ”°(€€€€€€€€€ô¤ì(€€€€€€€ô(€€€€€ô•±Í”ì(€€€€€€€…Ý…¥ÐÕÁ‘…Ñ•MÑ…•AÉ½É•ÍÌ¡ì¥¹Ù•¹Ñ¥½¹%°ÍÑ…•%°™¥•±è™¥•±¹­•ä°Ù…±Õ”ô¤ì(€€€€€ô(€€€ô…Ñ ì(€€€€€€¼¼Í¥±•¹Ñ±ä¡…¹‘±”ì¹•áÐÍ…Ù”Ý¥±°É•ÑÉä(€€€ô(€ôì((€½¹ÍÐ¡…¹‘±•‘Ù…¹”€ô…Íå¹Œ€ ¤€ôøì(€€€Í•Ñ‘Ù…¹¥¹œ¡ÑÉÕ”¤ì(€€€ÑÉäì(€€€€€ÑÉ…­½¹Ñ¥¹Õ•±¥­•¡ÍÑ…•%°ÕÉÉ•¹ÑMÑ…”¹¹…µ”°¥¹Ù•¹Ñ¥½¹%¤ì(€€€€€¥˜€¡É•…‘¥¹•ÍÍMÑ…Ñ”€ôôô€‰I•…‘äÑ¼5½Ù”½ÉÝ…Éˆ¤ì(€€€€€€€ÑÉ…­MÑ…•½µÁ±•Ñ•¡ÍÑ…•%°ÕÉÉ•¹ÑMÑ…”¹¹…µ”°¥¹Ù•¹Ñ¥½¹%¤ì(€€€€€€€½¹ÍÐ¹•áÑMÑ…•%€ô…Ý…¥Ð…‘Ù…¹•MÑ…”¡ì¥¹Ù•¹Ñ¥½¹%ô¤ì(€€€€€€€€¼¼¹Õ±°µ•…¹Ì¹¼¹•áÐ•¹…‰±•ÍÑ…”ƒŠPÝ”É”‘½¹”Ý¥Ñ …±°…Ñ¥Ù”ÍÑ…•Ì(€€€€€€€¥˜€¡¹•áÑMÑ…•%€ôôô¹Õ±°¤ì(€€€€€€€€€Í•ÑM¡½Ý½¹É…ÑÌ¡ÑÉÕ”¤ì(€€€€€€€€€É•ÑÕÉ¸ì(€€€€€€€ô(€€€€€ô(€€€€€É½ÕÑ•È¹ÁÕÍ  ˆ½‘…Í¡‰½…Éˆ¤ì(€€€ô…Ñ ì(€€€€€Í•Ñ‘Ù…¹¥¹œ¡™…±Í”¤ì(€€€ô(€ôì((€É•ÑÕÉ¸€ (€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µ¥¸µ µÍÉ••¸™±•à™±•àµ½°‰œµ‰…­É½Õ¹ˆø(€€€€€€ñÁÁ9…Ø€¼ø((€€€€€€ñµ…¥¸±…ÍÍ9…µ”ô‰™±•à´Äˆø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µàµ…ÕÑ¼µ…àµÜ´Õá°Áà´ÐÍ´éÁà´ØÁä´ÄÀˆø(€€€€€€€€€ì¼¨	…¬±¥¹¬€¨½ô(€€€€€€€€€€ñ1¥¹¬(€€€€€€€€€€€¡É•˜ôˆ½‘…Í¡‰½…Éˆ(€€€€€€€€€€€±…ÍÍ9…µ”ô‰¥¹±¥¹”µ™±•à¥Ñ•µÌµ•¹Ñ•È…À´Ä¸ÔÑ•áÐµÍ´Ñ•áÐµµÕÑ•µ™½É•É½Õ¹¡½Ù•ÈéÑ•áÐµ™½É•É½Õ¹ÑÉ…¹Í¥Ñ¥½¸µ½±½ÉÌµˆ´àˆ(€€€€€€€€€€ø(€€€€€€€€€€€€ñÉÉ½Ý1•™Ð±…ÍÍ9…µ”ô‰ ´ÐÜ´Ðˆ€¼ø(€€€€€€€€€€€	…¬Ñ¼…Í¡‰½…É(€€€€€€€€€€ð½1¥¹¬ø((€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰É¥…À´à±œéÉ¥µ½±ÌµlÅ™É|É™Étˆø(€€€€€€€€€€€ì¼¨ƒŠRŠR 1•™ÐÁ…¹•°èÍÑ…ÑÕÌƒŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠR €¨½ô(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰ÍÁ…”µä´Øˆø(€€€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰™±•à¥Ñ•µÌµ•¹Ñ•È©ÕÍÑ¥™äµ‰•ÑÝ••¸µˆ´Äˆø(€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµáÌ™½¹Ðµµ•‘¥Õ´ÕÁÁ•É…Í”ÑÉ…­¥¹œµÝ¥‘•ÍÐÑ•áÐµÁÉ¥µ…Éäˆø(€€€€€€€€€€€€€€€€€€€MÑ…”íÍÑ…•%‘ô(€€€€€€€€€€€€€€€€€€ð½Àø(€€€€€€€€€€€€€€€€€€ñ%¹Ù•¹Ñ¥½¹…É‘5•¹Ô(€€€€€€€€€€€€€€€€€€€¥¹Ù•¹Ñ¥½¹%õí¥¹Ù•¹Ñ¥½¹%‘ô(€€€€€€€€€€€€€€€€€€€¥¹Ù•¹Ñ¥½¹Q¥Ñ±”õí¥¹Ù•¹Ñ¥½¸¹Ñ¥Ñ±•ô(€€€€€€€€€€€€€€€€€€€½¹•±•Ñ•õì ¤€ôøÉ½ÕÑ•È¹ÁÕÍ  ˆ½½¹‰½…É‘¥¹œˆ¥ô(€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€€€ñ Ä(€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰Ñ•áÐ´Éá°™½¹Ðµ‰½±Ñ•áÐµ™½É•É½Õ¹ˆ(€€€€€€€€€€€€€€€€€ÍÑå±”õíì™½¹Ñ…µ¥±äè€‰Ù…È ´µ™½¹Ðµ¡•…‘¥¹œ¤°Õ¤µÍ…¹ÌµÍ•É¥˜°ÍåÍÑ•´µÕ¤°Í…¹ÌµÍ•É¥˜ˆõô(€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€íÕÉÉ•¹ÑMÑ…”¹¹…µ•ô(€€€€€€€€€€€€€€€€ð½ Äø(€€€€€€€€€€€€€€ð½‘¥Øø((€€€€€€€€€€€€€€ñI•…‘¥¹•ÍÍ	…‘”ÍÑ…Ñ”õíÉ•…‘¥¹•ÍÍMÑ…Ñ•ô€¼ø((€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµÍ´Ñ•áÐµµÕÑ•µ™½É•É½Õ¹¥Ñ…±¥Œ±•…‘¥¹œµÉ•±…á•‰½É‘•Èµ°´È‰½É‘•ÈµÁÉ¥µ…Éä¼ÌÀÁ°´Ìˆø(€€€€€€€€€€€€€€€í¹•áÑÑ¥½¹ô(€€€€€€€€€€€€€€ð½Àø((€€€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµáÌÑ•áÐµµÕÑ•µ™½É•É½Õ¹µˆ´Èˆø(€€€€€€€€€€€€€€€€€í½µÁ±•Ñ•‘¥•±‘Ì¹±•¹Ñ¡ô½™ìˆ€‰ô(€€€€€€€€€€€€€€€€€íÕÉÉ•¹ÑMÑ…”¹½µÁ±•Ñ¥½¹É¥Ñ•É¥„ü¹±•¹Ñ €üü€Áô™¥•±‘Ì½µÁ±•Ñ”(€€€€€€€€€€€€€€€€ð½Àø(€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Üµ™Õ±° ´Ä¸ÔÉ½Õ¹‘•µ™Õ±°‰œµµÕÑ•½Ù•É™±½Üµ¡¥‘‘•¸ˆø(€€€€€€€€€€€€€€€€€€ñ‘¥Ø(€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰ µ™Õ±°‰œµÁÉ¥µ…ÉäÉ½Õ¹‘•µ™Õ±°ÑÉ…¹Í¥Ñ¥½¸µ…±°‘ÕÉ…Ñ¥½¸´ÔÀÀˆ(€€€€€€€€€€€€€€€€€€€ÍÑå±”õíì(€€€€€€€€€€€€€€€€€€€€€Ý¥‘Ñ è€‘ì(€€€€€€€€€€€€€€€€€€€€€€€ÕÉÉ•¹ÑMÑ…”¹½µÁ±•Ñ¥½¹É¥Ñ•É¥„ü¹±•¹Ñ (€€€€€€€€€€€€€€€€€€€€€€€€€€ü€¡½µÁ±•Ñ•‘¥•±‘Ì¹±•¹Ñ €¼ÕÉÉ•¹ÑMÑ…”¹½µÁ±•Ñ¥½¹É¥Ñ•É¥„¹±•¹Ñ ¤€¨€ÄÀÀ(€€€€€€€€€€€€€€€€€€€€€€€€€€è€À(€€€€€€€€€€€€€€€€€€€€€ô•€°(€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€ð½‘¥Øø((€€€€€€€€€€€€€íÉ•…‘¥¹•ÍÍMÑ…Ñ”€ôôô€‰I•…‘äÑ¼5½Ù”½ÉÝ…Éˆ€ü€ (€€€€€€€€€€€€€€€€ñ	ÕÑÑ½¸(€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰Üµ™Õ±°…À´Èˆ(€€€€€€€€€€€€€€€€€½¹±¥¬õí¡…¹‘±•‘Ù…¹•ô(€€€€€€€€€€€€€€€€€‘¥Í…‰±•õí…‘Ù…¹¥¹ô(€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€í…‘Ù…¹¥¹œ€ü€‰5½Ù¥¹œ™½ÉÝ…É“Š˜ˆ€è€‰½¹Ñ¥¹Õ”ƒŠH‰ô(€€€€€€€€€€€€€€€€€ì……‘Ù…¹¥¹œ€˜˜€ñÉÉ½ÝI¥¡Ð±…ÍÍ9…µ”ô‰ ´ÐÜ´Ðˆ€¼ùô(€€€€€€€€€€€€€€€€ð½	ÕÑÑ½¸ø(€€€€€€€€€€€€€€¤€è€ (€€€€€€€€€€€€€€€€ñ	ÕÑÑ½¸(€€€€€€€€€€€€€€€€€Ù…É¥…¹Ðô‰½ÕÑ±¥¹”ˆ(€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰Üµ™Õ±°…À´Èˆ(€€€€€€€€€€€€€€€€€½¹±¥¬õí¡…¹‘±•‘Ù…¹•ô(€€€€€€€€€€€€€€€€€‘¥Í…‰±•õí…‘Ù…¹¥¹ô(€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€M…Ù”€˜…Í¡‰½…É(€€€€€€€€€€€€€€€€ð½	ÕÑÑ½¸ø(€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€ð½‘¥Øø((€€€€€€€€€€€ì¼¨ƒŠRŠR I¥¡ÐÁ…¹•°è™¥•±‘ÌƒŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠRŠR €¨½ô(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰ÍÁ…”µä´Øˆø(€€€€€€€€€€€€€€ñ È(€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰Ñ•áÐµ±œ™½¹ÐµÍ•µ¥‰½±Ñ•áÐµ™½É•É½Õ¹ˆ(€€€€€€€€€€€€€€€ÍÑå±”õíì™½¹Ñ…µ¥±äè€‰Ù…È ´µ™½¹Ðµ¡•…‘¥¹œ¤°Õ¤µÍ…¹ÌµÍ•É¥˜°ÍåÍÑ•´µÕ¤°Í…¹ÌµÍ•É¥˜ˆõô(€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€í¥¹Ù•¹Ñ¥½¸¹Ñ¥Ñ±•ô(€€€€€€€€€€€€€€ð½ Èø((€€€€€€€€€€€€€í™¥•±‘Ìü¹µ…À ¡™¥•±¤€ôøì(€€€€€€€€€€€€€€€½¹ÍÐ¥Í½¹”€ô½µÁ±•Ñ•‘¥•±‘Ì¹¥¹±Õ‘•Ì¡™¥•±¹­•ä¤ì(€€€€€€€€€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€€€€€€€€€€ñ‘¥Ø­•äõí™¥•±¹­•åô±…ÍÍ9…µ”ô‰ÍÁ…”µä´Èˆø(€€€€€€€€€€€€€€€€€€€€ñ1…‰•°(€€€€€€€€€€€€€€€€€€€€€¡Ñµ±½Èõí™¥•±¹­•åô(€€€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”õí¥Í½¹”€ü€‰Ñ•áÐµ™½É•É½Õ¹ˆ€è€‰Ñ•áÐµµÕÑ•µ™½É•É½Õ¹‰ô(€€€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€€í™¥•±¹±…‰•±ô(€€€€€€€€€€€€€€€€€€€€€í¥Í½¹”€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰µ°´ÈÑ•áÐµÁÉ¥µ…ÉäÑ•áÐµáÌ™½¹Ðµ¹½Éµ…°ˆûŠrLÍ…Ù•ð½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€€ð½1…‰•°ø(€€€€€€€€€€€€€€€€€€€í™¥•±¹ÑåÁ”€ôôô€‰Ñ•áÑ…É•„ˆ€ü€ (€€€€€€€€€€€€€€€€€€€€€€ñQ•áÑ…É•„(€€€€€€€€€€€€€€€€€€€€€€€¥õí™¥•±¹­•åô(€€€€€€€€€€€€€€€€€€€€€€€Ù…±Õ”õí™¥•±‘Y…±Õ•Ím™¥•±¹­•åt€üü€ˆ‰ô(€€€€€€€€€€€€€€€€€€€€€€€½¹¡…¹”õì¡”¤€ôø(€€€€€€€€€€€€€€€€€€€€€€€€€Í•Ñ¥•±‘Y…±Õ•Ì ¡Ø¤€ôø€¡ì€¸¸¹Ø°m™¥•±¹­•åtè”¹Ñ…É•Ð¹Ù…±Õ”ô¤¤(€€€€€€€€€€€€€€€€€€€€€€€ô(€€€€€€€€€€€€€€€€€€€€€€€½¹	±ÕÈõì ¤€ôø¡…¹‘±•	±ÕÈ¡™¥•±¥ô(€€€€€€€€€€€€€€€€€€€€€€€Á±…•¡½±‘•Èõí™¥•±¹Á±…•¡½±‘•Éô(€€€€€€€€€€€€€€€€€€€€€€€É½ÝÌõìÑô(€€€€€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰É•Í¥é”µ¹½¹”ˆ(€€€€€€€€€€€€€€€€€€€€€€€€¼¼MÑ…”€Ä™¥•±‘Ì…É”•‘¥Ñ…‰±”€¡¥¹±¥¹”•‘¥Ð¤(€€€€€€€€€€€€€€€€€€€€€€€É•…‘=¹±äõíÍÑ…•%€ôôô€Ä€˜˜€…l‰ÁÉ½‰±•µMÑ…Ñ•µ•¹Ðˆ°€‰Ñ…É•ÑÕ‘¥•¹”ˆ°€‰Í½±ÕÑ¥½¹•ÍÉ¥ÁÑ¥½¸ˆ°€‰Ñ¥Ñ±”‰t¹¥¹±Õ‘•Ì¡™¥•±¹­•ä¥ô(€€€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€€€¤€è€ (€€€€€€€€€€€€€€€€€€€€€€ñ%¹ÁÕÐ(€€€€€€€€€€€€€€€€€€€€€€€¥õí™¥•±¹­•åô(€€€€€€€€€€€€€€€€€€€€€€€Ù…±Õ”õí™¥•±‘Y…±Õ•Ím™¥•±¹­•åt€üü€ˆ‰ô(€€€€€€€€€€€€€€€€€€€€€€€½¹¡…¹”õì¡”¤€ôø(€€€€€€€€€€€€€€€€€€€€€€€€€Í•Ñ¥•±‘Y…±Õ•Ì ¡Ø¤€ôø€¡ì€¸¸¹Ø°m™¥•±¹­•åtè”¹Ñ…É•Ð¹Ù…±Õ”ô¤¤(€€€€€€€€€€€€€€€€€€€€€€€ô(€€€€€€€€€€€€€€€€€€€€€€€½¹	±ÕÈõì ¤€ôø¡…¹‘±•	±ÕÈ¡™¥•±¥ô(€€€€€€€€€€€€€€€€€€€€€€€Á±…•¡½±‘•Èõí™¥•±¹Á±…•¡½±‘•Éô(€€€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€ô¥ô((€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµáÌÑ•áÐµµÕÑ•µ™½É•É½Õ¹ˆø(€€€€€€€€€€€€€€€¥•±‘ÌÍ…Ù”…ÕÑ½µ…Ñ¥…±±äÝ¡•¸å½Ôµ½Ù”Ñ¼Ñ¡”¹•áÐ½¹”¸(€€€€€€€€€€€€€€ð½Àø(€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€ð½‘¥Øø((€€€€€€€€€ì¼¨)½ÕÉ¹•äµ…À€¨½ô(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µÐ´ÄÈÁÐ´à‰½É‘•ÈµÐ‰½É‘•Èµ‰½É‘•Èˆø(€€€€€€€€€€€€ñ)½ÕÉ¹•å5…ÀÕÉÉ•¹ÑMÑ…•%õíÍÑ…•%‘ô¥¹Ù•¹Ñ¥½¹%õí¥¹Ù•¹Ñ¥½¹%‘ô€¼ø(€€€€€€€€€€ð½‘¥Øø(€€€€€€€€ð½‘¥Øø(€€€€€€ð½µ…¥¸ø((€€€€€€ñ™½½Ñ•È±…ÍÍ9…µ”ô‰‰½É‘•ÈµÐ‰½É‘•Èµ‰½É‘•Èˆø(€€€€€€€€ñ5…‘•Q¡¥Í	…‘”€¼ø(€€€€€€ð½™½½Ñ•Èø(€€€€ð½‘¥Øø(€€¤ì)ô(