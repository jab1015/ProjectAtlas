"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { api } from "@convex/_generated/api";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Building2 } from "lucide-react";
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

interface OrganizationSummary {
  organizationId: string;
  name: string;
  kind: "personal" | "company" | "studio";
  role: "owner" | "admin" | "member" | "viewer" | "professional";
  activeInventionLimit: number | null;
}

const getMyOrganizations = makeFunctionReference<"query", Record<string, never>, OrganizationSummary[]>("organizations:getMyOrganizations");
const ensurePersonalOrganization = makeFunctionReference<"mutation", Record<string, never>, { organizationId: string }>("organizations:ensurePersonalOrganization");
const createOrganizationInvention = makeFunctionReference<
  "mutation",
  { organizationId: string; title: string; problemStatement?: string; targetAudience?: string; solutionDescription?: string },
  { inventionId: string }
>("organizationInventions:create");

const STEPS: OnboardingStep[] = [
  { id: "problemStatement", question: "What problem does your invention solve?", hint: "Describe the frustration, gap, or inefficiency you've noticed.", type: "textarea" },
  { id: "targetAudience", question: "Who experiences this problem most?", hint: "Think about the person who would pay for a solution today.", type: "textarea" },
  { id: "solutionDescription", question: "Describe your invention — what is it and how does it solve the problem?", hint: "Be as specific as you can. This is just for you.", type: "textarea" },
  { id: "title", question: "Give your invention a working title.", hint: "Don't overthink it — you can change this later.", type: "text" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedOrganizationId = searchParams.get("organizationId");
  const { isAuthenticated, isLoading } = useConvexAuth();
  const organizations = useQuery(getMyOrganizations, isAuthenticated ? {} : "skip");
  const ensureProfile = useMutation(api.users.ensureUserProfile);
  const ensureOrganization = useMutation(ensurePersonalOrganization);
  const createInvention = useMutation(createOrganizationInvention);

  const selectedOrganization = useMemo(() => {
    if (!organizations?.length) return null;
    const requested = requestedOrganizationId
      ? organizations.find((organization) => organization.organizationId === requestedOrganizationId)
      : null;
    return requested ?? organizations.find((organization) => organization.kind === "personal") ?? organizations[0];
  }, [organizations, requestedOrganizationId]);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) ensureProfile().catch(() => undefined);
  }, [isAuthenticated, ensureProfile]);

  useEffect(() => {
    if (!isAuthenticated || organizations === undefined || organizations.length > 0) return;
    void ensureOrganization({}).catch(() => undefined);
  }, [ensureOrganization, isAuthenticated, organizations]);

  useEffect(() => {
    if (isAuthenticated) trackOnboardingStarted();
  }, [isAuthenticated]);

  const current = STEPS[step];
  const currentValue = answers[current?.id ?? ""] ?? "";
  const canContinue = currentValue.trim().length > 0;
  const isLastStep = step === STEPS.length - 1;
  const canCreateInSelectedOrganization = selectedOrganization && !["viewer", "professional"].includes(selectedOrganization.role);

  const handleContinue = async () => {
    if (!canContinue) return;
    if (!isLastStep) {
      setStep((value) => value + 1);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let organizationId = selectedOrganization?.organizationId;
      if (!organizationId) {
        const ensured = await ensureOrganization({});
        organizationId = ensured.organizationId;
      }
      if (selectedOrganization && !canCreateInSelectedOrganization) {
        throw new Error("Your organization role cannot create inventions.");
      }

      trackOnboardingCompleted();
      const result = await createInvention({
        organizationId,
        title: answers.title ?? "",
        problemStatement: answers.problemStatement ?? "",
        targetAudience: answers.targetAudience ?? "",
        solutionDescription: answers.solutionDescription ?? "",
      });
      trackInventionCreated(result.inventionId);
      router.push(`/invention/${result.inventionId}/journey`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "InventSmith could not create the invention. Please try again.");
      setSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void handleContinue();
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <AtlasLogo size="sm" className="text-primary" />
          {selectedOrganization && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Building2 className="h-4 w-4" /><span>Creating in <strong className="font-medium text-foreground">{selectedOrganization.name}</strong></span></div>
          )}
        </div>
      </header>

      <div className="border-b border-border bg-muted/20">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 sm:px-6">
          {STEPS.map((item, index) => <div key={item.id} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${index <= step ? "bg-primary" : "bg-border"}`} />)}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl space-y-8">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-primary">Step {step + 1} of {STEPS.length}</p>
            <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">{current.question}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{current.hint}</p>
          </div>

          <div>
            {current.type === "textarea" ? (
              <Textarea key={current.id} value={currentValue} onChange={(event) => setAnswers((value) => ({ ...value, [current.id]: event.target.value }))} onKeyDown={handleKeyDown} placeholder="Write anything — you can edit this later." rows={5} className="resize-none text-base" autoFocus />
            ) : (
              <Input key={current.id} value={currentValue} onChange={(event) => setAnswers((value) => ({ ...value, [current.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") void handleContinue(); }} placeholder="Working title…" className="h-12 text-base" autoFocus />
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {selectedOrganization && !canCreateInSelectedOrganization && <p className="text-sm text-destructive">Your {selectedOrganization.role} role cannot create inventions in this organization.</p>}

          <div className="flex items-center gap-3">
            {step > 0 && <Button variant="ghost" onClick={() => setStep((value) => value - 1)} className="gap-2" disabled={submitting}><ArrowLeft className="h-4 w-4" />Back</Button>}
            <Button onClick={() => void handleContinue()} disabled={!canContinue || submitting || Boolean(selectedOrganization && !canCreateInSelectedOrganization)} className="ml-auto gap-2" size="lg">
              {submitting ? "Creating your invention…" : isLastStep ? "Create Invention" : "Continue"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">{current.type === "textarea" ? "Press ⌘ + Enter to continue" : "Press Enter to continue"}</p>
        </div>
      </div>

      <MadeThisBadge />
    </div>
  );
}
