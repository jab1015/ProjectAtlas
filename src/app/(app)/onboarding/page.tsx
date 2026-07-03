"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { AtlasLogo } from "@/components/atlas/atlas-logo";
import {
  trackOnboardingStarted,
  trackOnboardingCompleted,
  trackInventionCreated,
} from "@/lib/analytics";

interface OnboardingStep {
  id: string;
  question: string;
  hint: string;
  type: "textarea" | "text";
}

const STEPS: OnboardingStep[] = [
  {
    id: "problemStatement",
    question: "What problem does your invention solve?",
    hint: "Describe the frustration, gap, or inefficiency you've noticed.",
    type: "textarea",
  },
  {
    id: "targetAudience",
    question: "Who experiences this problem most?",
    hint: "Think about the person who would pay for a solution today.",
    type: "textarea",
  },
  {
    id: "solutionDescription",
    question: "Describe your invention — what is it and how does it solve the problem?",
    hint: "Be as specific as you can. This is just for you.",
    type: "textarea",
  },
  {
    id: "title",
    question: "Give your invention a working title.",
    hint: "Don't overthink it — you can change this later.",
    type: "text",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const createInvention = useMutation(api.journeyEngine.createInvention);
  const ensureProfile = useMutation(api.users.ensureUserProfile);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  // Ensure user profile (role + tier) is set — seeds admin on first sign-in
  useEffect(() => {
    if (isAuthenticated) {
      ensureProfile().catch(() => {});
    }
  }, [isAuthenticated, ensureProfile]);

  // Track onboarding start on mount
  useEffect(() => {
    if (isAuthenticated) {
      trackOnboardingStarted();
    }
  }, [isAuthenticated]);

  const current = STEPS[step];
  const currentValue = answers[current?.id ?? ""] ?? "";
  const canContinue = currentValue.trim().length > 0;
  const isLastStep = step === STEPS.length - 1;

  const handleContinue = async () => {
    if (!canContinue) return;

    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }

    // Submit
    setSubmitting(true);
    setError(null);
    try {
      trackOnboardingCompleted();
      const inventionId = await createInvention({
        title: answers.title ?? "",
        problemStatement: answers.problemStatement ?? "",
        targetAudience: answers.targetAudience ?? "",
        solutionDescription: answers.solutionDescription ?? "",
      });
      trackInventionCreated(inventionId);
      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleContinue();
    }
  };

  if (isLoading || !isAuthenticated) {
    return null; // Redirect in effect
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center">
          <AtlasLogo size="sm" className="text-primary" />
        </div>
      </header>

      {/* Step progress */}
      <div className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1 rounded-full flex-1 transition-colors duration-300 ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl space-y-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary mb-3">
              Step {step + 1} of {STEPS.length}
            </p>
            <h1
              className="text-2xl sm:text-3xl font-bold text-foreground leading-tight"
              style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
            >
              {current.question}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{current.hint}</p>
          </div>

          <div>
            {current.type === "textarea" ? (
              <Textarea
                key={current.id}
                value={currentValue}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [current.id]: e.target.value }))
                }
                onKeyDown={handleKeyDown}
                placeholder="Write anything — you can edit this later."
                rows={5}
                className="resize-none text-base"
                autoFocus
              />
            ) : (
              <Input
                key={current.id}
                value={currentValue}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [current.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleContinue();
                }}
                placeholder="Working title…"
                className="text-base h-12"
                autoFocus
              />
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex items-center gap-3">
            {step > 0 && (
              <Button
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                className="gap-2"
                disabled={submitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              onClick={handleContinue}
              disabled={!canContinue || submitting}
              className="gap-2 ml-auto"
              size="lg"
            >
              {submitting
                ? "Creating your invention…"
                : isLastStep
                ? "Create Invention"
                : "Continue"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {current.type === "textarea"
              ? "Press ⌘ + Enter to continue"
              : "Press Enter to continue"}
          </p>
        </div>
      </div>

      <MadeThisBadge />
    </div>
  );
}
