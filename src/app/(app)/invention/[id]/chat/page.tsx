"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { ArrowLeft, Bot, Send, UserRound } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import { AppNav } from "@/components/atlas/app-nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatMessage {
  _id: Id<"conversationMessages">;
  role: "user" | "assistant";
  content: string;
  status: "pending" | "complete" | "failed";
}

const getConversation = makeFunctionReference<
  "query",
  { inventionId: Id<"inventions"> },
  { invention: { _id: Id<"inventions">; title: string }; messages: ChatMessage[] }
>("atlasChat:getConversation");

const askInventSmith = makeFunctionReference<
  "mutation",
  { inventionId: Id<"inventions">; content: string },
  Id<"conversationMessages">
>("atlasChat:ask");

const captureInventorChatEvidence = makeFunctionReference<
  "mutation",
  { inventionId: Id<"inventions">; content: string },
  { captured: boolean; reason: "not_material" | "duplicate" | "captured"; sourceId?: Id<"evidenceSources"> }
>("chatEvidenceCapture:captureInventorChatEvidence");

export default function InventSmithChatPage() {
  const params = useParams();
  const router = useRouter();
  const inventionId = params.id as Id<"inventions">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const conversation = useQuery(
    getConversation,
    isAuthenticated && inventionId ? { inventionId } : "skip"
  );
  const ask = useMutation(askInventSmith);
  const captureEvidence = useMutation(captureInventorChatEvidence);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = message.trim();
    if (!content || sending) return;
    setSending(true);
    setError(null);
    setMessage("");
    try {
      await ask({ inventionId, content });
      // Material inventor facts, evidence links, test results, quotes and status observations
      // become governed project evidence. Capture failure never prevents the saved chat question.
      void captureEvidence({ inventionId, content }).catch(() => undefined);
    } catch (reason) {
      setMessage(content);
      setError(reason instanceof Error ? reason.message : "InventSmith could not save your message.");
    } finally {
      setSending(false);
    }
  }

  if (isLoading || !isAuthenticated || conversation === undefined) {
    return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-3xl px-4 py-12 text-sm text-muted-foreground">Loading Ask InventSmith…</main></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 py-6 sm:px-6">
        <div className="mb-5 flex items-start gap-3 border-b border-border pb-5">
          <Button asChild variant="ghost" size="icon" aria-label="Back to dashboard">
            <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Ask InventSmith</p>
            <h1 className="text-2xl font-semibold">{conversation.invention.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Ask across the complete invention project: evidence, research, departments, work queues, handoffs, design, CAD, reviews, decisions, deliverables, risks, and next steps. InventSmith distinguishes verified evidence from drafts and inventor-provided inputs.</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pb-6" aria-live="polite">
          {conversation.messages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <Bot className="mx-auto h-8 w-8 text-primary" />
              <h2 className="mt-3 font-semibold">What would you like to know?</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Ask what InventSmith has completed, what each department is doing, what evidence supports a conclusion, what is blocked, or what happens next. If you supply material project facts, URLs, test results, quotes, survey/interview findings, or patent-status observations, InventSmith records them as inventor-provided evidence for the project to evaluate.</p>
            </div>
          )}
          {conversation.messages.map((item) => (
            <article key={item._id} className={`flex gap-3 ${item.role === "user" ? "justify-end" : "justify-start"}`}>
              {item.role === "assistant" && <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10"><Bot className="h-4 w-4 text-primary" /></span>}
              <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${item.role === "user" ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}>
                {item.content}
                {item.status === "failed" && <p className="mt-2 text-xs opacity-70">The AI service did not complete this reply.</p>}
              </div>
              {item.role === "user" && <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted"><UserRound className="h-4 w-4" /></span>}
            </article>
          ))}
          {sending && <p className="text-sm text-muted-foreground">Saving your question…</p>}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSubmit} className="sticky bottom-0 border-t border-border bg-background py-4">
          {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
          <div className="flex items-end gap-2">
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              maxLength={4000}
              placeholder="Ask InventSmith about any part of this invention…"
              className="min-h-12 resize-none"
              aria-label="Message InventSmith"
            />
            <Button type="submit" size="icon" disabled={!message.trim() || sending} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Material inventor input can become project evidence, but remains unverified until checked. Professional/legal/engineering approval remains gated where required.</p>
        </form>
      </main>
    </div>
  );
}
