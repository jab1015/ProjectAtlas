"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQueries, type RequestForQueries } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { userFacingError } from "@/lib/userFacingError";
import { publicSurveyIntroduction } from "@/lib/publicSurveyIntroduction";

type PublicSurvey = {
  title: string;
  introduction: string;
  kind: "survey" | "interview";
  questions: Array<{ id: string; prompt: string }>;
  inventionTitle: string;
};

const getRequest = makeFunctionReference<
  "query",
  { token: string },
  PublicSurvey | null
>("evidenceRequests:getPublic");
const submitResponse = makeFunctionReference<
  "mutation",
  { token: string; answers: Array<{ questionId: string; answer: string }>; respondentName?: string },
  { submitted: boolean }
>("evidenceRequests:submit");

export default function PublicEvidenceResponsePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const requestQueries = useMemo<RequestForQueries>(() => {
    if (!token) return {} as RequestForQueries;
    return { request: { query: getRequest, args: { token } } };
  }, [token]);
  const queryResults = useQueries(requestQueries);
  const request = queryResults.request as PublicSurvey | null | undefined | Error;
  const submit = useMutation(submitResponse);
  const [name, setName] = useState("");
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const answeredCount = useMemo(
    () => Object.values(answersByQuestion).filter((answer) => answer.trim()).length,
    [answersByQuestion],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (answeredCount === 0) {
      setError("Please answer at least one question before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      await submit({
        token,
        respondentName: name.trim() || undefined,
        answers: Object.entries(answersByQuestion).map(([questionId, answer]) => ({ questionId, answer })),
      });
      setSubmitted(true);
    } catch (cause) {
      setError(userFacingError(cause, "We could not save your response. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">InventSmith · {request && !(request instanceof Error) && request.kind === "interview" ? "Interview" : "Survey"}</p>
        <h1 className="text-3xl font-bold">{request && !(request instanceof Error) ? request.title : "Share your experience"}</h1>
        <p className="text-sm text-muted-foreground">{request && !(request instanceof Error) ? publicSurveyIntroduction(request.introduction) : "Your feedback helps an inventor understand this problem and evaluate an idea."}</p>
      </div>

      {request === undefined ? <p className="text-sm text-muted-foreground">Loading questions…</p> : request instanceof Error ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">This survey could not be loaded right now. Please ask the inventor for a fresh link.</div>
      ) : request === null ? (
        <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">This survey link is unavailable or has been closed.</div>
      ) : submitted ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6"><h2 className="text-xl font-semibold">Thank you for sharing your feedback.</h2><p className="mt-2 text-sm text-muted-foreground">Your response was recorded for {request.inventionTitle}. It will be treated as respondent-provided evidence, not independently verified fact.</p></div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6 rounded-xl border border-border bg-card p-5 sm:p-7">
          <div className="space-y-2"><Label htmlFor="respondent-name">Name (optional)</Label><Input id="respondent-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} autoComplete="name" /></div>
          {request.questions.map((question, index) => (
            <div key={question.id} className="space-y-2"><Label htmlFor={question.id}>{index + 1}. {question.prompt}</Label><Textarea id={question.id} rows={3} maxLength={4000} value={answersByQuestion[question.id] ?? ""} onChange={(event) => setAnswersByQuestion((previous) => ({ ...previous, [question.id]: event.target.value }))} /></div>
          ))}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">Please don’t include sensitive personal information. Your response is shared with the inventor for this project.</p>
          <Button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit response"}</Button>
        </form>
      )}
    </main>
  );
}
